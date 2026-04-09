const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 9010,
  path: '/api/health',
  method: 'GET'
};

console.log('--- TESTE DE CONEXÃO COM A PORTA 9010 ---');
console.log(`Tentando contato com: ${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`RESPOSTA: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`ERRO: ${e.message}`);
  console.log('DICA: Seu servidor na porta 9010 parece estar inacessível via 127.0.0.1.');
});

req.end();

const options2 = { ...options, hostname: 'localhost' };
console.log(`Tentando contato com: ${options2.hostname}:${options2.port}${options2.path}`);
const req2 = http.request(options2, (res) => {
  console.log(`STATUS (localhost): ${res.statusCode}`);
});
req2.on('error', (e) => {
  console.error(`ERRO (localhost): ${e.message}`);
});
req2.end();
