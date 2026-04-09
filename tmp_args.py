
target = "principal.go"
with open(target, "r", encoding="utf-8") as f:
    text = f.read()

inject = """
f, _ := os.OpenFile("debug_startup.txt", os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
f.WriteString("Exe: " + exeName + "\nArgs: " + strings.Join(os.Args, " ") + "\nModulo: " + modulo + "\n")
f.Close()
"""

# inject right after modulo = ... loop
text = text.replace("\tapp := NovoApp(modulo)", inject + "\n\tapp := NovoApp(modulo)")

with open(target, "w", encoding="utf-8") as f:
    f.write(text)
