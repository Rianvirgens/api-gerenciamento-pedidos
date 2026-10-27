const express = require('express');
const pedidosRoutes = require('./routes/pedidosRoutes');

const app = express();

app.use(express.json());

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
