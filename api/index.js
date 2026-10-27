const app = require('../src/app');

app.get('/', (req, res) => {
  res.json({
    projeto: 'API de Gerenciamento de Pedidos',
    aluno: 'Rian Santo das Virgens',
    rgm: '45370231',
    rotas: ['/pedidos', '/pedidos/:id', '/pedidos/:id/status']
  });
});

module.exports = app;
