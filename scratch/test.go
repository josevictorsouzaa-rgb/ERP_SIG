package main

import (
	"fmt"
	"core-erp/motor"
)

func main() {
	strCon := "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"
	dbMotor, err := motor.NovoMotor(strCon)
	if err != nil {
		fmt.Printf("❌ ERRO FATAL DE BANCO: %v\n", err)
		return
	}
	lista, err := dbMotor.ListarProdutos()
	if err != nil {
		fmt.Println("Erro ListarProdutos:", err)
		return
	}
	fmt.Printf("Total returned: %d\n", len(lista))
	
	listaPesquisa, errPesquisa := dbMotor.PesquisarProdutosAvancado(motor.FiltrosProdutos{})
	if errPesquisa != nil {
		fmt.Println("Erro PesquisarProdutosAvancado:", errPesquisa)
		return
	}
	fmt.Printf("Total returned from search: %d\n", len(listaPesquisa))
}
