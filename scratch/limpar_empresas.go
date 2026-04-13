package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	strCon := "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"
	db, err := sql.Open("pgx", strCon)
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}
	defer db.Close()

	// Clear table
	_, err = db.ExecContext(context.Background(), "TRUNCATE TABLE empresas RESTART IDENTITY CASCADE;")
	if err != nil {
		log.Fatalf("Erro ao limpar banco: %v", err)
	}

	fmt.Println("Tabela empresas limpa com sucesso.")
}
