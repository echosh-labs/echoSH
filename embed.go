package main

import (
	"embed"
	_ "embed"
)

//go:embed mercury_foundational_statement.txt
var EmbeddedFoundationalStatement string

//go:embed migrations/*.sql
var EmbeddedMigrations embed.FS
