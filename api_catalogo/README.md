# API Interna de Catálogo (DPK Integration)

API interna em Node.js (Express) para integração com o catálogo de autopeças da DPK. O ERP consome esta API, evitando exposição de credenciais e normalizando os dados de diferentes fontes em um formato consistente.

## Destaques Arquiteturais
- **Tecnologias:** Node.js, Express, Axios.
- **Cache Local:** Respostas são armazenadas em memória `node-cache` por um TTL de 24 horas para evitar estouro da cota (Rate Limit) da DPK e aumentar a agilidade.
- **Normalização Customizada:** Interpreta de forma inteligente Combustível, Motor, Marca, Modelo e as Versões através da heurística do `parser.service.js`.

## Instalação
1. Com o Node.js instalado no servidor, execute o comando:
   ```bash
   npm install
   ```
2. Renomeie (ou copie) `.env.example` para `.env` na raiz da pasta.
3. Insira sua verdadeira `DPK_API_KEY` dentro do arquivo `.env`.

## Como Rodar
- Ambiente de desenvolvimento / Execução normal: `npm start` ou `npm run dev`.
- O Servidor iniciará por padrão na porta `9000` (caso nenhuma configuração substitua).

## Endpoints

### 1) Buscar Produto por Código (GET)
Retorna os detalhes de um produto isolado normalizado.

**Requisição:**
`GET http://localhost:9000/api/catalogo/produto?codigo=SYL1043`

**Retorno:**
```json
{
  "codigoPesquisado": "SYL1043",
  "encontrado": true,
  "produto": {
    "id": 3185020,
    "codigo": "1043",
    "fabricante": "SYL",
    "descricao": "PASTILHA FREIO",
    "sapCode": "4212517",
    "ean": "7890000000000",
    "ncm": "8708.30.90",
    "grupo": "FREIO",
    "subgrupo": "PASTILHA FREIO",
    "imagem": "https://cdn-superk.azureedge.net/img/SYL_1043.jpg"
  },
  "especificacoes": [...],
  "aplicacoes": [...],
  "equivalentes": [...]
}
```

### 2) Consulta em Lote (POST)

**Requisição:**
`POST http://localhost:9000/api/catalogo/lote`

**Body:**
```json
{
  "codigos": ["SYL1043", "RCPT07920"]
}
```

### 3) Healthcheck (GET)
Retorna `{"status": "ok"}` caso a API esteja operando normalmente.

**Requisição:**
`GET http://localhost:9000/api/health`
