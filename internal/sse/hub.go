package sse

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

type Event struct {
	Type      string      `json:"type"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
}

type Client struct {
	send chan Event
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Event
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Event, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[SSE Hub] Client connected. Total active streams: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[SSE Hub] Client disconnected. Total active streams: %d", len(h.clients))

		case event := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- event:
				default:
					// Slow client buffer full, drop and unregister
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()

		case <-ticker.C:
			// Heartbeat keep-alive ping
			h.Broadcast("heartbeat", map[string]interface{}{
				"status": "active",
				"time":   time.Now().UTC().Format(time.RFC3339),
			})
		}
	}
}

func (h *Hub) Broadcast(eventType string, payload interface{}) {
	event := Event{
		Type:      eventType,
		Payload:   payload,
		Timestamp: time.Now().UTC(),
	}
	select {
	case h.broadcast <- event:
	default:
		log.Println("[SSE Hub] Broadcast channel saturated; dropping event.")
	}
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported by client", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache, no-transform")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	client := &Client{send: make(chan Event, 64)}
	h.register <- client

	// Send initial connection event
	initialData, _ := json.Marshal(Event{
		Type: "connected",
		Payload: map[string]interface{}{
			"message": "Connected to Mercury Dasha Live SSE Stream",
			"engine":  "Go SSE Hub (BoltDB & PostgreSQL Reactive)",
		},
		Timestamp: time.Now().UTC(),
	})
	fmt.Fprintf(w, "event: connected\ndata: %s\n\n", initialData)
	flusher.Flush()

	defer func() {
		h.unregister <- client
	}()

	notify := r.Context().Done()
	for {
		select {
		case <-notify:
			return
		case event, ok := <-client.send:
			if !ok {
				return
			}
			data, err := json.Marshal(event)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event.Type, data)
			flusher.Flush()
		}
	}
}
