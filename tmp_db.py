
import psycopg2
conn = psycopg2.connect("postgres://postgres:123@localhost:5432/postgres?sslmode=disable")
cur = conn.cursor()
cur.execute("SELECT id, nome, senha, login FROM usuarios")
rows = cur.fetchall()
for r in rows:
    print(r)
