let pedidos = [];

const nomesStatus = {
  recebido: 'Recebido',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

const proximos = {
  recebido: [['em_preparacao', 'Preparar'], ['cancelado', 'Cancelar']],
  em_preparacao: [['enviado', 'Enviar'], ['cancelado', 'Cancelar']],
  enviado: [['entregue', 'Entregar']],
  entregue: [],
  cancelado: []
};

const lista = document.getElementById('lista');
const vazio = document.getElementById('vazio');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = 'mensagem ' + tipo;
}

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function texto(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function carregar() {
  const res = await fetch('/pedidos');
  pedidos = await res.json();
  desenhar();
}

function desenhar() {
  const busca = document.getElementById('busca').value.toLowerCase().trim();
  const status = document.getElementById('filtroStatus').value;

  const filtrados = pedidos.filter((p) => {
    const okBusca = !busca || p.cliente.toLowerCase().includes(busca) || String(p.id) === busca;
    const okStatus = !status || p.status === status;
    return okBusca && okStatus;
  });

  lista.innerHTML = filtrados.map((p) => {
    const botoes = proximos[p.status]
      .map(([st, nome]) => `<button class="sec" onclick="mudarStatus(${p.id}, '${st}')">${nome}</button>`)
      .join('');
    return `<tr>
      <td>${p.id}</td>
      <td>${texto(p.cliente)}</td>
      <td>${p.tipo}</td>
      <td>${p.prioridade}</td>
      <td>${moeda(p.valor)}</td>
      <td>${nomesStatus[p.status]}</td>
      <td>${botoes}<button class="sec" onclick="excluir(${p.id})">Excluir</button></td>
    </tr>`;
  }).join('');

  vazio.style.display = filtrados.length ? 'none' : 'block';
}

async function mudarStatus(id, status) {
  const res = await fetch(`/pedidos/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const dados = await res.json();
  if (!res.ok) {
    mostrarMensagem(dados.erro, 'erro');
    return;
  }
  mostrarMensagem('Status atualizado.', 'ok');
  carregar();
}

async function excluir(id) {
  if (!confirm('Excluir o pedido ' + id + '?')) return;
  const res = await fetch('/pedidos/' + id, { method: 'DELETE' });
  if (!res.ok) {
    const dados = await res.json();
    mostrarMensagem(dados.erro, 'erro');
    return;
  }
  mostrarMensagem('Pedido excluído.', 'ok');
  carregar();
}

document.getElementById('formPedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  const corpo = {
    cliente: document.getElementById('cliente').value,
    tipo: document.getElementById('tipo').value,
    valor: parseFloat(document.getElementById('valor').value),
    prioridade: document.getElementById('prioridade').value
  };

  const res = await fetch('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
  });
  const dados = await res.json();

  if (!res.ok) {
    mostrarMensagem(dados.erro, 'erro');
    return;
  }

  mostrarMensagem('Pedido ' + dados.id + ' cadastrado.', 'ok');
  e.target.reset();
  carregar();
});

document.getElementById('busca').addEventListener('input', desenhar);
document.getElementById('filtroStatus').addEventListener('change', desenhar);

carregar();
