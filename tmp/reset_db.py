import psycopg2
import sys

conn_str = "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"

def reset():
    try:
        print("🔗 Tentando resetar matriz_fiscal...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Kill other connections to the same table if possible
        cur.execute("""
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = 'postgres' AND pid <> pg_backend_pid();
        """)
        
        cur.execute("TRUNCATE TABLE matriz_fiscal RESTART IDENTITY CASCADE;")
        print("✅ Tabela resetada. IDs recomeçam do 1.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Erro no reset: {e}")

if __name__ == "__main__":
    reset()
