const request = require('supertest');
const app = require('../src/app');
const pedidosService = require('../src/services/pedidosService');

describe('API de Gerenciamento de Pedidos', () => {
  beforeEach(() => {
    pedidosService.limparPedidos();
  });

  describe('POST /pedidos', () => {
    it('deve cadastrar um novo pedido valido e retornar HTTP 201 com status inicial recebido', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Carlos Silva',
          tipo: 'entrega',
          valor: 350,
          prioridade: 'normal'
        });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toEqual({
        id: 1,
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    it('deve retornar HTTP 400 quando o nome do cliente estiver vazio ou apenas com espacos', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: '   ',
          tipo: 'entrega',
          valor: 150,
          prioridade: 'normal'
        });

      expect(resposta.status).toBe(400);
      expect(resposta.body).toHaveProperty('erro');
    });

    it('deve retornar HTTP 400 quando o valor for menor ou igual a zero', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Carlos Silva',
          tipo: 'entrega',
          valor: 0,
          prioridade: 'normal'
        });

      expect(resposta.status).toBe(400);
      expect(resposta.body).toHaveProperty('erro');
    });

    it('deve retornar HTTP 400 quando tipo ou prioridade nao forem reconhecidos', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Mariana Costa',
          tipo: 'drone',
          valor: 120,
          prioridade: 'urgente'
        });

      expect(resposta.status).toBe(400);
      expect(resposta.body).toHaveProperty('erro');
    });
  });

  describe('GET /pedidos e GET /pedidos/:id', () => {
    it('deve listar todos os pedidos cadastrados com HTTP 200', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      const resposta = await request(app).get('/pedidos');
      expect(resposta.status).toBe(200);
      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body).toHaveLength(1);
      expect(resposta.body[0].cliente).toBe('Carlos Silva');
    });

    it('deve consultar um pedido existente pelo ID com HTTP 200', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Ana Souza',
        tipo: 'retirada',
        valor: 89.9,
        prioridade: 'alta'
      });

      const resposta = await request(app).get('/pedidos/1');
      expect(resposta.status).toBe(200);
      expect(resposta.body.id).toBe(1);
      expect(resposta.body.cliente).toBe('Ana Souza');
    });

    it('deve retornar HTTP 404 ao consultar um ID inexistente', async () => {
      const resposta = await request(app).get('/pedidos/999');
      expect(resposta.status).toBe(404);
      expect(resposta.body).toHaveProperty('erro');
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    it('deve atualizar o status do pedido quando a transicao for valida (HTTP 200)', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      const resposta = await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'cancelado' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('cancelado');
    });

    it('deve bloquear transicao de status invalida com HTTP 400 (ex: cancelar pedido ja entregue)', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Roberto Lima',
        tipo: 'entrega',
        valor: 200,
        prioridade: 'normal'
      });

      await request(app).patch('/pedidos/1/status').send({ status: 'em_preparacao' });
      await request(app).patch('/pedidos/1/status').send({ status: 'enviado' });
      await request(app).patch('/pedidos/1/status').send({ status: 'entregue' });

      const tentativaInvalida = await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'cancelado' });

      expect(tentativaInvalida.status).toBe(400);
      expect(tentativaInvalida.body).toHaveProperty('erro');
    });

    it('deve retornar HTTP 404 ao tentar atualizar status de pedido inexistente', async () => {
      const resposta = await request(app)
        .patch('/pedidos/55/status')
        .send({ status: 'em_preparacao' });

      expect(resposta.status).toBe(404);
      expect(resposta.body).toHaveProperty('erro');
    });
  });
});
