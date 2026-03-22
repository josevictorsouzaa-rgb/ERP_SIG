import psycopg2
import sys

# Script de Carga Definitiva SIG: O "Recheio" Master de Autopeças
conn_str = "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"

def super_seed():
    try:
        print("🔗 Conectando ao PostgreSQL local...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()

        # 1. Garantir que as tabelas existem (segundo o esquema do motor/produtos.go)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS categorias (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) UNIQUE NOT NULL,
                criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS componentes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
                subcategoria_id INT,
                criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(categoria_id, nome)
            );
        """)

        # 2. Definição da Taxonomia SIG (Mestre Automotivo)
        taxonomy = {
            "FREIOS": ["PASTILHA DE FREIO", "DISCO DE FREIO", "TAMBOR DE FREIO", "SAPATA DE FREIO", "CILINDRO MESTRE", "HIDROVACUO", "CILINDRO DE RODA", "SENSOR ABS", "FLEXIVEL DE FREIO", "CABO DE FREIO", "PINÇA DE FREIO", "REPARO DE FREIO", "PATIM DE FREIO", "LIQUIDO DE FREIO (DOT4)", "LONA DE FREIO"],
            "SUSPENSÃO": ["AMORTECEDOR", "MOLA HELICOIDAL", "BIELETA", "BANDEJA", "PIVO DA SUSPENSÃO", "TERMINAL DE DIREÇÃO", "AXIAL DE DIREÇÃO", "COXIM DO AMORTECEDOR", "BATENTE E COIFA", "BUCHA DA BANDEJA", "BUCHA ESTABILIZADORA", "BUCHA DO EIXO TRASEIRO", "PIVOT DE SUSPENSÃO", "BRAÇO OSCILANTE", "BARRA ESTABILIZADORA"],
            "MOTOR": ["PISTAO MOTOR", "ANEL MOTOR", "VALVULA ADMISSÃO", "VALVULA ESCAPE", "JUNTA CABEÇOTE", "JUNTA TAMPA VALVULA", "BRONZINA BIELA", "BRONZINA MANCAL", "CORREIA DENTADA", "TENSIONADOR", "BOMBA DE OLEO", "COLETOR ESCAPE", "FILTRO DE ÓLEO", "JUNTA DO CARTER", "CAMISA DE CILINDRO", "GUIA DE VALVULA", "RETENTOR DE VALVULA", "SEDE DE VALVULA", "EIXO COMANDO DE VALVULA"],
            "ARREFECIMENTO": ["RADIADOR", "BOMBA D'AGUA", "VALVULA TERMOSTATICA", "RESERVATORIO EXPANSÃO", "ADITIVO RADIADOR", "MANGUEIRA RADIADOR", "SENSOR TEMPERATURA", "ELETROVENTILADOR", "TAMPA DO RESERVATORIO", "POLIA VISCOSA", "TUBO D'AGUA", "MANGUEIRA DO AQUECEDOR"],
            "TRANSMISSÃO": ["KIT EMBREAGEM", "PLATÔ", "DISCO EMBREAGEM", "ROLAMENTO GUIA", "ATUADOR HIDRAULICO", "HOMOCINETICA", "TULIPA", "TRIZETA", "REPARO DE JUNTA", "CABO DE SELEÇÃO", "COXIM DO CAMBIO", "RETENTOR DE SEMI-EIXO", "REPARO DE HOMOCINETICA", "JUNTA HOMOCINETICA"],
            "ELÉTRICA/ELETRÔNICA": ["BATERIA", "ALTERNADOR", "MOTOR DE PARTIDA", "VELA DE IGNIÇÃO", "CABO DE VELA", "BOBINA DE IGNIÇÃO", "DISTRIBUIDOR", "MODULO DE INJEÇÃO (ECU)", "SENSOR MAF (FLUXO AR)", "SENSOR MAP (PRESSÃO)", "SENSOR TPS (BORBOLETA)", "SENSOR OXIGÊNIO (LAMBDA)", "BICO INJETOR", "BOMBA DE COMBUSTIVEL", "FILTRO DE COMBUSTIVEL", "SENSOR DE ROTAÇÃO", "SENSOR DE DETONAÇÃO"],
            "ILUMINAÇÃO": ["FAROL DIANTEIRO", "LANTERNA TRASEIRA", "FAROL DE MILHA", "LANTERNA DE PLACA", "FAROL AUXILIAR", "PISCA-PISCA (DIRECIONAL)", "LÂMPADA HALOGENA", "LÂMPADA LED", "LÂMPADA XENON", "RELE DE PISCA", "MODULO DE FAROL"],
            "LATARIA/ACESSÓRIOS": ["PARA-CHOQUE", "CAPO", "PARA-LAMA", "PORTA", "TAMPA TRASEIRA", "RETROVISOR", "MOLDURA DE PARA-LAMA", "GRADE RADIADOR", "MAÇANETA", "LIMPADOR DE PARA-BRISA", "TAPETE", "ENGATE", "CALOTA", "ANTENA", "RAQUETE (PALHETA)"],
            "DIREÇÃO": ["CAIXA DE DIREÇÃO", "SETOR DE DIREÇÃO", "BOMBA HIDRAULICA", "RESERVATORIO DIREÇÃO", "TERMINAL AXIAL", "BRAÇO PITMAN", "BRAÇO AUXILIAR", "ARTICULAÇÃO AXIAL", "REPARO DE DIREÇÃO"]
        }

        total_cats = 0
        total_comps = 0
        
        for cat, components in taxonomy.items():
            # Inserir Categoria
            cur.execute("INSERT INTO categorias (nome) VALUES (%s) ON CONFLICT (nome) DO NOTHING;", (cat,))
            cur.execute("SELECT id FROM categorias WHERE nome = %s;", (cat,))
            cat_id = cur.fetchone()[0]
            total_cats += 1
            
            # Inserir componentes vinculados
            for comp in components:
                cur.execute("INSERT INTO componentes (categoria_id, nome) VALUES (%s, %s) ON CONFLICT (categoria_id, nome) DO NOTHING;", (cat_id, comp))
                total_comps += 1

        print(f"✅ SUCESSO! Banco de Dados Recheado.")
        print(f"📊 Resumo: {total_cats} Categorias e {total_comps} Componentes.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ ERRO: {e}")
        sys.exit(1)

if __name__ == "__main__":
    super_seed()
