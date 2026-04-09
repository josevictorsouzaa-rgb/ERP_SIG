import psycopg2
import sys

# Script de Carga Fiscal SIG v3: Refatoração Estrutural (Parte 1)
# Objetivo: Reconstruir a Matriz Fiscal para decisão tributária pura
conn_str = "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"

def run_seed():
    try:
        print("🔗 Conectando ao PostgreSQL...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()

        print("🛠️  Reconstruindo Matriz Fiscal (Arquitetura Simplificada)...")
        # Remover a tabela antiga para garantir a nova estrutura limpa
        cur.execute("DROP TABLE IF EXISTS matriz_fiscal CASCADE;")
        
        # Criar a nova tabela conforme a ESTRUTURA FINAL proposta
        cur.execute("""
            CREATE TABLE matriz_fiscal (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                ativa BOOLEAN DEFAULT true,
                
                -- CONDIÇÕES
                regime_tributario TEXT DEFAULT 'TODOS', -- SIMPLES, PRESUMIDO, REAL, TODOS
                operacao TEXT DEFAULT 'TODAS',         -- ENTRADA, SAIDA, TODAS
                tipo_destino TEXT DEFAULT 'TODOS',      -- INTERNA, INTERESTADUAL, INTERNACIONAL, TODOS
                incidencia_st TEXT DEFAULT 'TODOS',     -- SIM, NAO, TODOS
                ncm TEXT DEFAULT '',                    -- Prefixo ou Completo
                prioridade INTEGER DEFAULT 10,           -- 10=PADRÃO, 50=ALTA, 100=CRÍTICA
                
                -- RESULTADOS
                cfop TEXT,
                cst_csosn TEXT,
                destaca_icms BOOLEAN DEFAULT false,
                credito_icms BOOLEAN DEFAULT false,
                incide_ipi BOOLEAN DEFAULT false,
                incide_pis BOOLEAN DEFAULT false,
                incide_cofins BOOLEAN DEFAULT false,
                incide_difal BOOLEAN DEFAULT false
            );
        """)

        print("🚀 Carregando as 12 regras tributárias fundamentais (NOVO MODELO)...")
        
        # Mapeamento de prioridades para números
        # PADRÃO = 10, ALTA = 50, CRÍTICA = 100
        
        regras = [
            # NOME, REGIME, OPERACAO, TIPO_DESTINO, ST, NCM, PRIORIDADE(INT), CFOP, CST, D_ICMS, C_ICMS, IPI, PIS, COFINS, DIFAL
            
            # --- VENDAS (SAÍDA) ---
            ("VENDA INTERNA SIMPLES (SIM/NÃO ST)", "SIMPLES", "SAIDA", "INTERNA", "TODOS", "", 10, "5102", "102", True, False, False, True, True, False),
            ("VENDA INTERESTADUAL (SIM/NÃO ST)", "SIMPLES", "SAIDA", "INTERESTADUAL", "TODOS", "", 10, "6102", "102", True, False, False, True, True, True),
            ("VENDA INTERNA COM SUBSTITUIÇÃO ST", "SIMPLES", "SAIDA", "INTERNA", "SIM", "", 50, "5405", "500", True, False, False, False, False, False),
            ("VENDA INTERESTADUAL COM SUBSTITUIÇÃO ST", "SIMPLES", "SAIDA", "INTERESTADUAL", "SIM", "", 50, "6404", "500", True, False, False, False, False, False),

            # --- COMPRAS (ENTRADA) ---
            ("COMPRA INTERNA PARA REVENDA", "TODOS", "ENTRADA", "INTERNA", "TODOS", "", 10, "1102", "102", True, False, False, True, True, False),
            ("COMPRA INTERESTADUAL PARA REVENDA", "TODOS", "ENTRADA", "INTERESTADUAL", "TODOS", "", 10, "2102", "102", True, False, False, True, True, False),
            ("COMPRA COM SUBSTITUIÇÃO TRIBUTÁRIA", "TODOS", "ENTRADA", "TODOS", "SIM", "", 50, "1403", "500", True, False, False, False, False, False),

            # --- DEVOLUÇÕES (CRÍTICA) ---
            ("DEVOLUÇÃO DE VENDA INTERNA", "TODOS", "ENTRADA", "INTERNA", "TODOS", "", 100, "1202", "102", True, False, False, False, False, False),
            ("DEVOLUÇÃO DE VENDA INTERESTADUAL", "TODOS", "ENTRADA", "INTERESTADUAL", "TODOS", "", 100, "2202", "102", True, False, False, False, False, False),
            ("DEVOLUÇÃO DE COMPRA INTERNA", "TODOS", "SAIDA", "INTERNA", "TODOS", "", 100, "5202", "400", True, False, False, False, False, False),
            ("DEVOLUÇÃO DE COMPRA INTERESTADUAL", "TODOS", "SAIDA", "INTERESTADUAL", "TODOS", "", 100, "6202", "400", True, False, False, False, False, False),
            
            # --- OUTRAS ---
            ("TRANSFERÊNCIA ENTRE FILIAIS", "TODOS", "SAIDA", "TODOS", "TODOS", "", 50, "5152", "400", True, False, False, False, False, False)
        ]

        for r in regras:
            cur.execute("""
                INSERT INTO matriz_fiscal (
                    nome, regime_tributario, operacao, tipo_destino, incidencia_st, ncm, prioridade,
                    cfop, cst_csosn, destaca_icms, credito_icms, incide_ipi, incide_pis, incide_cofins, incide_difal, ativa
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true)
            """, r)
            print(f"  - Inserida: Regra '{r[0]}' (Prioridade: {r[6]})")

        print("\n✅ Matriz Fiscal estruturada e carregada com sucesso!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERRO: {e}")

if __name__ == "__main__":
    run_seed()
