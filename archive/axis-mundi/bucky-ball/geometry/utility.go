// utility.go - Helper functions for cycle normalization and deduplication in Buckyball geometry.
package geometry

import "sort"

// contains checks if a slice contains a specific integer value.
func contains(slice []int, val int) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

// NormalizeCycle sorts vertex indices to identify unique face sets for deduplication.
func NormalizeCycle(cycle []int) []int {
	normalized := make([]int, len(cycle))
	copy(normalized, cycle)
	sort.Ints(normalized)
	return normalized
}