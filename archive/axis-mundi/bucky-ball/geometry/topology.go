// topology.go - Defines the geometric structure constants for a C60 Buckyball (Truncated Icosahedron).
package geometry

// Buckyball stores the fundamental counts for the C60 structure.
type Buckyball struct {
	Faces    int // 32 total (20 hexagons, 12 pentagons)
	Vertices int // 60 vertices
	Edges    int // 90 edges
}