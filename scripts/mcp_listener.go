package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type Directive struct {
	ID                 string `json:"id"`
	Source             string `json:"source"`
	Title              string `json:"title"`
	RawNote            string `json:"raw_note"`
	TriagedInstruction string `json:"triaged_instruction"`
	Type               string `json:"type"`
	IsExecute          bool   `json:"is_execute"`
	Status             string `json:"status"`
}

func main() {
	port := "3000"
	baseURL := fmt.Sprintf("http://localhost:%s", port)

	fmt.Println("==========================================================")
	fmt.Println(" 👁️  AXIS MUNDI ZERO-TOKEN MCP AGENT LISTENER ACTIVE")
	fmt.Printf("    Target Server: %s\n", baseURL)
	fmt.Println("    Token Consumption: 0 AI Tokens (Passive Background Watcher)")
	fmt.Println("    Listening for incoming [EXECUTE] notes from Google Keep...")
	fmt.Println("==========================================================")

	streamURL := fmt.Sprintf("%s/api/stream/events", baseURL)
	client := &http.Client{Timeout: 0}

	for {
		req, err := http.NewRequest("GET", streamURL, nil)
		if err != nil {
			time.Sleep(2 * time.Second)
			continue
		}
		req.Header.Set("Accept", "text/event-stream")

		resp, err := client.Do(req)
		if err != nil {
			time.Sleep(2 * time.Second)
			continue
		}

		reader := bufio.NewReader(resp.Body)
		var currentEvent string

		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				resp.Body.Close()
				break
			}

			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "event:") {
				currentEvent = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
			} else if strings.HasPrefix(line, "data:") {
				data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
				if currentEvent == "axismundi_execute_alert" {
					var d Directive
					if err := json.Unmarshal([]byte(data), &d); err == nil && d.IsExecute {
						resp.Body.Close()
						reportAndExit(&d)
					}
				}
			}
		}

		time.Sleep(1 * time.Second)
	}
}

func reportAndExit(d *Directive) {
	fmt.Println("")
	fmt.Println("==========================================================")
	fmt.Println("⚡ [AXIS MUNDI EXECUTE DIRECTIVE RECEIVED FROM GOOGLE KEEP] ⚡")
	fmt.Println("==========================================================")
	fmt.Printf("ID:          %s\n", d.ID)
	fmt.Printf("Source:      %s\n", d.Source)
	fmt.Printf("Title:       %s\n", d.Title)
	fmt.Printf("Type:        %s\n", d.Type)
	fmt.Printf("Status:      %s\n", d.Status)
	fmt.Println("----------------------------------------------------------")
	fmt.Println("TRIAGED INSTRUCTION:")
	fmt.Println(d.TriagedInstruction)
	fmt.Println("----------------------------------------------------------")
	fmt.Println("RAW NOTE CONTENT:")
	fmt.Println(d.RawNote)
	fmt.Println("==========================================================")
	os.Exit(0)
}