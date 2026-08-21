// coordinates.go - Generates Euclidean coordinates for a C60 Buckyball (Truncated Icosahedron).
package geometry

import "math"

// Vertex represents a 3D point in space.
type Vertex struct {
	X, Y, Z float64
}

// GetVertices returns the 60 Cartesian coordinates of a unit Buckyball.
func GetVertices() []Vertex {
	phi := (1.0 + math.Sqrt(5.0)) / 2.0 // Golden ratio

	coords := []Vertex{}

	// Permutation groups for a truncated icosahedron
	// 1: (0, ±1, ±3phi)
	coords = append(coords, generatePermutations(0, 1.0, 3.0*phi)...)

	// 2: (±1, ±(2 + phi), ±2phi)
	coords = append(coords, generatePermutations(1.0, 2.0+phi, 2.0*phi)...)

	// 3: (±phi, ±2, ±(2phi + 1))
	coords = append(coords, generatePermutations(phi, 2.0, 2.0*phi+1.0)...)

	return coords
}