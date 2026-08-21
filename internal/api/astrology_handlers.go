package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) ContextListHandler(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	nodes, err := h.store.ListContextNodes(category)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, nodes)
}

func (h *Handler) ContextDetailHandler(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "key")
	if key == "" {
		http.Error(w, "Missing key parameter", http.StatusBadRequest)
		return
	}

	node, err := h.store.GetContextNodeWithRelatives(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if h.hub != nil {
		h.hub.Broadcast("graph_resonance", map[string]interface{}{
			"key":   node.Key,
			"title": node.Title,
		})
	}

	jsonResponse(w, http.StatusOK, node)
}

func (h *Handler) DashaHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if dasha, err := h.pgRepo.GetDashaOverview(ctx); err == nil && dasha != nil {
			jsonResponse(w, http.StatusOK, dasha)
			return
		}
	}

	dasha, err := h.store.GetDashaOverview()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, dasha)
}

func (h *Handler) NakshatraHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if nakshatras, err := h.pgRepo.GetNakshatras(ctx); err == nil && len(nakshatras) > 0 {
			jsonResponse(w, http.StatusOK, nakshatras)
			return
		}
	}

	nakshatras, err := h.store.GetNakshatras()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, nakshatras)
}

func (h *Handler) AlchemicalHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if principles, err := h.pgRepo.GetAlchemicalPrinciples(ctx); err == nil && len(principles) > 0 {
			jsonResponse(w, http.StatusOK, principles)
			return
		}
	}

	principles, err := h.store.GetAlchemicalPrinciples()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, principles)
}

func (h *Handler) OracleDailyHandler(w http.ResponseWriter, r *http.Request) {
	oracle, err := h.store.GetDailyOracle()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if h.hub != nil {
		h.hub.Broadcast("oracle_pulse", oracle)
	}

	jsonResponse(w, http.StatusOK, oracle)
}