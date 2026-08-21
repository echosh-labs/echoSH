// adjacency.go - Implements the adjacency matrix for vertex connectivity in C60.
package geometry

import "math"

// AdjacencyMatrix defines connections between 60 vertices.
type AdjacencyMatrix [60][60]bool

// GetAdjacency identifies neighbors based on a fixed distance threshold (bond length).
func GetAdjacency(v []Vertex) AdjacencyMatrix {
	// Threshold slightly above unit distance to account for float precision.
	const threshold = 2.001 
	adj := AdjacencyMatrix{}

	for i := 0; i < 60; i++ {
		for j := i + 1; j < 60; j++ {
			dist := math.Sqrt(
				math.Pow(v[i].X-v[j].X, 2) +
				math.Pow(v[i].Y-v[j].Y, 2) +
				math.Pow(v[i].Z-v[j].Z, 2))
			if dist < threshold {
				adj[i][j] = true
				adj[j][i] = true
			}
		}
	}
	return adj
}