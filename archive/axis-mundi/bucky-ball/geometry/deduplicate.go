// deduplicate.go - Filters and identifies 60 unique vertices for the C60 Buckyball using epsilon comparison.
package geometry

import "math"

// UniqueVertices filters a slice of vertices to remove duplicates caused by floating-point permutations.
func UniqueVertices(input []Vertex) []Vertex {
	const epsilon = 1e-9
	unique := []Vertex{}

	for _, v := range input {
		isNew := true
		for _, u := range unique {
			if math.Abs(v.X-u.X) < epsilon &&
				math.Abs(v.Y-u.Y) < epsilon &&
				math.Abs(v.Z-u.Z) < epsilon {
				isNew = false
				break
			}
		}
		if isNew {
			unique = append(unique, v)
		}
	}
	return unique
}