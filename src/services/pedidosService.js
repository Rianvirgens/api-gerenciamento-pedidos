// Regras de negocio e armazenamento em memoria dos pedidos
// Aluno: Rian Santo das Virgens | RGM: 45370231

let pedidos = [];
let proximoId = 1;

const TIPOS_VALIDOS = ['entrega', 'retirada'];
const PRIORIDADES_VALIDAS = ['baixa', 'normal', 'alta'];
const STATUS_VALIDOS = ['recebido', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];

// Regras de transicao de status permitidas
const TRANSICOES_PERMITIDAS = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: []
};

function criarErroValidacao(mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = 400;
  return erro;
}

function criarErroNaoEncontrado(mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = 404;
  return erro;
}

function cadastrarPedido(dados) {
  if (!dados || typeof dados !== 'object') {
    throw criarErroValidacao('Corpo da requisicao invalido.');
  }

  const { cliente, tipo, valor, prioridade } = dados;

  // Validacao do cliente: texto nao vazio mesmo tirando espacos
  if (typeof cliente !== 'string' || cliente.trim().length === 0) {
    throw criarErroValidacao('O campo "cliente" e obrigatorio e nao pode estar vazio.');
  }

  // Validacao do valor: numerico e maior que zero
  if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
    throw criarErroValidacao('O campo "valor" deve ser um numero maior que zero.');
  }

  // Validacao do tipo
  if (typeof tipo !== 'string' || !TIPOS_VALIDOS.includes(tipo.trim().toLowerCase())) {
    throw criarErroValidacao(`O campo "tipo" deve ser um dos valores aceitos: ${TIPOS_VALIDOS.join(', ')}.`);
  }

  // Validacao da prioridade
  if (typeof prioridade !== 'string' || !PRIORIDADES_VALIDAS.includes(prioridade.trim().toLowerCase())) {
    throw criarErroValidacao(`O campo "prioridade" deve ser um dos valores aceitos: ${PRIORIDADES_VALIDAS.join(', ')}.`);
  }

  const novoPedido = {
    id: proximoId++,
    cliente: cliente.trim(),
    tipo: tipo.trim().toLowerCase(),
    valor,
    prioridade: prioridade.trim().toLowerCase(),
    status: 'recebido'
  };

  pedidos.push(novoPedido);
  return novoPedido;
}

function listarPedidos() {
  return pedidos;
}

function buscarPedidoPorId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw criarErroNaoEncontrado('Pedido nao encontrado para o ID informado.');
  }

  const pedido = pedidos.find((item) => item.id === id);
  if (!pedido) {
    throw criarErroNaoEncontrado('Pedido nao encontrado para o ID informado.');
  }

  return pedido;
}

function atualizarStatusPedido(idParam, corpo) {
  const pedido = buscarPedidoPorId(idParam);

  if (!corpo || typeof corpo.status !== 'string' || corpo.status.trim().length === 0) {
    throw criarErroValidacao('O campo "status" e obrigatorio para atualizacao.');
  }

  const novoStatus = corpo.status.trim().toLowerCase();

  if (!STATUS_VALIDOS.includes(novoStatus)) {
    throw criarErroValidacao(`Status invalido. Valores permitidos: ${STATUS_VALIDOS.join(', ')}.`);
  }

  const permitidos = TRANSICOES_PERMITIDAS[pedido.status] || [];
  if (!permitidos.includes(novoStatus)) {
    throw criarErroValidacao(
      `Transicao de status invalida: nao e permitido mudar de "${pedido.status}" para "${novoStatus}".`
    );
  }

  pedido.status = novoStatus;
  return pedido;
}

// Funcao auxiliar usada nos testes automatizados para limpar a memoria entre os cenarios
function limparPedidos() {
  pedidos = [];
  proximoId = 1;
}

module.exports = {
  cadastrarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatusPedido,
  limparPedidos,
  TIPOS_VALIDOS,
  PRIORIDADES_VALIDAS,
  STATUS_VALIDOS,
  TRANSICOES_PERMITIDAS
};
