package sse

import (
	"context"
	"net/http/httptest"
	"sync"
	"testing"
	"time"
)

func TestHubLifecycleAndBroadcast(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// Register 3 clients
	client1 := &Client{send: make(chan Event, 10)}
	client2 := &Client{send: make(chan Event, 10)}
	client3 := &Client{send: make(chan Event, 10)}

	hub.register <- client1
	hub.register <- client2
	hub.register <- client3

	time.Sleep(50 * time.Millisecond)

	// Broadcast an event
	payload := map[string]string{"message": "quicksilver harmonic"}
	hub.Broadcast("test_event", payload)

	// Assert each client receives the event
	checkClient := func(c *Client, name string) {
		select {
		case msg := <-c.send:
			if msg.Type != "test_event" {
				t.Errorf("%s expected event type test_event, got %s", name, msg.Type)
			}
		case <-time.After(500 * time.Millisecond):
			t.Errorf("%s did not receive broadcast in time", name)
		}
	}

	checkClient(client1, "client1")
	checkClient(client2, "client2")
	checkClient(client3, "client3")

	// Unregister client2
	hub.unregister <- client2
	time.Sleep(50 * time.Millisecond)
}

func TestHubConcurrencySafety(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	var wg sync.WaitGroup
	numWorkers := 10

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			c := &Client{send: make(chan Event, 50)}
			hub.register <- c
			defer func() {
				hub.unregister <- c
			}()

			for j := 0; j < 5; j++ {
				hub.Broadcast("worker_event", map[string]interface{}{
					"worker": workerID,
					"seq":    j,
				})
				time.Sleep(5 * time.Millisecond)
			}
		}(i)
	}

	wg.Wait()
}

func TestHubHTTPHandling(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	req := httptest.NewRequest("GET", "/api/stream/events", nil).WithContext(ctx)
	w := httptest.NewRecorder()

	hub.ServeHTTP(w, req)

	if w.Header().Get("Content-Type") != "text/event-stream" {
		t.Errorf("expected Content-Type text/event-stream, got %s", w.Header().Get("Content-Type"))
	}
}