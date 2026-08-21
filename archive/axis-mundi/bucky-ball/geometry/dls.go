// dls.go - Implements Depth-Limited Search (DLS) for C60 cycle extraction.
package geometry

// FindCycles performs DLS to find all n-cycles (e.g., pentagons or hexagons).
func FindCycles(adj AdjacencyMatrix, size int) [][]int {
	var cycles [][]int
	
	var search func(curr, start, depth int, path []int)
	search = func(curr, start, depth int, path []int) {
		if depth == size {
			if adj[curr][start] {
				cycles = append(cycles, append([]int{}, path...))
			}
			return
		}
		
		for next := 0; next < 60; next++ {
			if adj[curr][next] && !contains(path, next) {
				search(next, start, depth+1, append(path, next))
			}
		}
	}
	
	for i := 0; i < 60; i++ {
		search(i, i, 1, []int{i})
	}
	return cycles
}