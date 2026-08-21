'use client';

import { useState, useEffect, useCallback } from "react";

export interface SSEMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export function useSSE(streamUrl: string = "/api/stream/events") {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<SSEMessage | null>(null);
  const [messages, setMessages] = useState<SSEMessage[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect after 5s
          reconnectTimeout = setTimeout(connect, 5000);
        };

        eventSource.onmessage = (e) => {
          try {
            const data: SSEMessage = JSON.parse(e.data);
            setLastEvent(data);
            setMessages((prev) => [data, ...prev.slice(0, 19)]);
          } catch {}
        };

        // Listen for specific event types
        const eventTypes = ["connected", "oracle_pulse", "graph_resonance", "heartbeat"];
        eventTypes.forEach((type) => {
          eventSource?.addEventListener(type, (e: any) => {
            try {
              const data: SSEMessage = JSON.parse(e.data);
              setLastEvent(data);
              setMessages((prev) => [data, ...prev.slice(0, 19)]);
            } catch {}
          });
        });
      } catch (err) {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [streamUrl]);

  return { isConnected, lastEvent, messages };
}
