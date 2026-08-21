package main

import (
	"embed"
	"io"
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

//go:embed frontend/out/*
var frontendEmbedFS embed.FS

//go:embed archive/*
var archiveEmbedFS embed.FS

// RegisterUIRoutes configures the HTTP router to serve the embedded Next.js static export
// and the preserved legacy archive (Axis Mundi & Foundations) with client-side SPA fallback.
func RegisterUIRoutes(r chi.Router) {
	// 1. Register Embedded Archive Routes (/archive/*) & Backward-Compatibility Redirects
	archiveFS, err := fs.Sub(archiveEmbedFS, "archive")
	if err != nil {
		log.Printf("[UI] Warning: Could not resolve embedded archive sub filesystem: %v", err)
	} else {
		archiveFileServer := http.StripPrefix("/archive", http.FileServer(http.FS(archiveFS)))

		r.Get("/archive*", func(w http.ResponseWriter, req *http.Request) {
			if req.URL.Path == "/archive" || req.URL.Path == "/archive/" {
				http.Redirect(w, req, "/archive/axis-mundi/", http.StatusMovedPermanently)
				return
			}
			archiveFileServer.ServeHTTP(w, req)
		})

		// Legacy path redirects
		r.Get("/axis-mundi*", func(w http.ResponseWriter, req *http.Request) {
			sub := strings.TrimPrefix(req.URL.Path, "/axis-mundi")
			http.Redirect(w, req, "/archive/axis-mundi"+sub, http.StatusMovedPermanently)
		})

		r.Get("/foundations*", func(w http.ResponseWriter, req *http.Request) {
			sub := strings.TrimPrefix(req.URL.Path, "/foundations")
			http.Redirect(w, req, "/archive/foundations"+sub, http.StatusMovedPermanently)
		})

		log.Println("[UI] Embedded Archive routes registered at /archive/* (with /axis-mundi and /foundations redirects).")
	}

	// 2. Register Next.js SPA Root Routes
	distFS, err := fs.Sub(frontendEmbedFS, "frontend/out")
	if err != nil {
		log.Printf("[UI] Warning: Could not resolve embedded frontend/out sub filesystem: %v", err)
		return
	}

	fileServer := http.FileServer(http.FS(distFS))

	r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
		path := strings.TrimPrefix(req.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		// Check if the requested file exists in embedded filesystem
		f, err := distFS.Open(path)
		if err != nil {
			// SPA Fallback: Serve index.html for client-side routing
			indexFile, indexErr := distFS.Open("index.html")
			if indexErr != nil {
				http.NotFound(w, req)
				return
			}
			defer indexFile.Close()
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			_, _ = io.Copy(w, indexFile)
			return
		}
		_ = f.Close()

		fileServer.ServeHTTP(w, req)
	})

	log.Println("[UI] Embedded Next.js frontend routes registered successfully.")
}
