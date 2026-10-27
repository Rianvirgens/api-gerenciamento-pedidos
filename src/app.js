const express = require('express');
const path = require('path');
const pedidosRoutes = require('./routes/pedidosRoutes');

const app = express();

// Middleware de CORS para permitir requisicoes de navegadores e clientes externos
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Servir os arquivos estaticos da interface web (public)
app.use(express.static(path.join(__dirname, '../public')));

app.use('/pedidos', pedidosRoutes);

// Tratamento de JSON malformado enviado no corpo da requisicao
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON invalido enviado no corpo da requisicao.' });
  }
  return next(err);
});

// Middleware centralizado de tratamento de erros (400, 404 e 500)
app.use((err, req, res, next) => {
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  console.error('Erro interno inesperado:', err);
  return res.status(500).json({ erro: 'Erro interno do servidor ao processar a solicitacao.' });
});

module.exports = app;
