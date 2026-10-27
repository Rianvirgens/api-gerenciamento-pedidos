const pedidosService = require('../services/pedidosService');

function criar(req, res, next) {
  try {
    const pedido = pedidosService.cadastrarPedido(req.body);
    return res.status(201).json(pedido);
  } catch (erro) {
    return next(erro);
  }
}

function listar(req, res, next) {
  try {
    const lista = pedidosService.listarPedidos();
    return res.status(200).json(lista);
  } catch (erro) {
    return next(erro);
  }
}

function buscarPorId(req, res, next) {
  try {
    const pedido = pedidosService.buscarPedidoPorId(req.params.id);
    return res.status(200).json(pedido);
  } catch (erro) {
    return next(erro);
  }
}

function atualizarStatus(req, res, next) {
  try {
    const pedidoAtualizado = pedidosService.atualizarStatusPedido(req.params.id, req.body);
    return res.status(200).json(pedidoAtualizado);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizarStatus
};
