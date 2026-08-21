package api

import (
	"net/http"
)

func (h *Handler) AudioPresetsHandler(w http.ResponseWriter, r *http.Request) {
	presets := []map[string]interface{}{
		{
			"name":        "Mercury Orbital Bell (141.27 Hz)",
			"category":    "Planetary & Esoteric",
			"description": "Tuned to the cosmic frequency of Mercury's planetary rotation and Buddhi discernment.",
			"fundamental": 141.27,
			"harmonics":   []float64{141.27, 282.54, 423.81, 565.08},
		},
		{
			"name":        "Tria Prima Quicksilver Drone",
			"category":    "Planetary & Esoteric",
			"description": "Deep alchemical drone reconciling Spiritus, Sulfur, and Salt with resonant filter sweeps.",
			"fundamental": 108.0,
			"harmonics":   []float64{108.0, 216.0, 324.0},
		},
		{
			"name":        "Rainbow Flutter",
			"category":    "Planetary & Esoteric",
			"description": "Tri-oscillator shimmering chord with vibrato and spatial dispersion.",
			"harmonics":   []float64{700.0, 900.0, 1200.0},
		},
		{
			"name":        "808 Kick",
			"category":    "Percussion",
			"description": "Punchy sub-bass kick with rapid pitch descent and warm lowpass filtering.",
			"rawCommand":  "raw osc:sine:150 env:0.01:0.3:0:0.05 dur:0.35 lfo:sine:30:-100:frequency filter:lowpass:500",
		},
		{
			"name":        "Snare Drum",
			"category":    "Percussion",
			"description": "White noise snap blended with a resonant sine body.",
			"rawCommand":  "raw noise:white env:0.01:0.1:0:0.05 dur:0.16 filter:bandpass:1500:5 osc:sine:200",
		},
	}
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"engine":  "Native Web Audio 2.0 Procedural DSP",
		"presets": presets,
	})
}