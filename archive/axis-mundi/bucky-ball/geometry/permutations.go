// permutations.go - Implements the coordinate permutation logic for vertex generation.
package geometry

// generatePermutations calculates the 8 sign combinations and 3 cyclic rotations for each coordinate triple.
func generatePermutations(a, b, c float64) []Vertex {
	v := []Vertex{}
	signs := []float64{1.0, -1.0}

	for _, sa := range signs {
		for _, sb := range signs {
			for _, sc := range signs {
				// Base permutation (±a, ±b, ±c)
				v = append(v, Vertex{sa * a, sb * b, sc * c})

				// Cyclic rotations: (b, c, a) and (c, a, b)
				// Distinct values check to prevent duplicates if a, b, or c are identical or zero
				if a != b || b != c {
					v = append(v, Vertex{sb * b, sc * c, sa * a})
					v = append(v, Vertex{sc * c, sa * a, sb * b})
				}
			}
		}
	}
	return v
}