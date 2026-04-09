
import psycopg2
conn = psycopg2.connect("postgres://postgres:123@localhost:5432/postgres?sslmode=disable")
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
for table in cur.fetchall():
    print(table[0])
