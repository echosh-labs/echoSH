// face.go - Defines polygons for the C60 Buckyball (Truncated Icosahedron).
package geometry

// Face represents a single side of the buckyball.
type Face struct {
	Vertices []int  // Indices of vertices in the global slice
	Type     string // "Pentagon" or "Hexagon"
}

// BuckyballStructure maps all 32 faces.
type BuckyballStructure struct {
	Faces []Face
}