# API de Gerenciamento de Pedidos

Projeto Prático Avaliativo - Tópicos Avançados em Sistemas de Informação II
Aluno: Rian Santo das Virgens - RGM 45370231

## Instalação e execução

```
npm install
npm start
```

O servidor sobe em http://localhost:3000 (a interface web fica na raiz). Para desenvolvimento, `npm run dev`.

## Rotas

| Método | Rota | Resultado |
|---|---|---|
| POST | /pedidos | 201 criado; 400 dados inválidos |
| GET | /pedidos | 200 lista (filtros opcionais: status, tipo, prioridade, busca) |
| GET | /pedidos/:id | 200 encontrado; 404 inexistente |
| PATCH | /pedidos/:id/status | 200 atualizado; 400 inválido; 404 inexistente |
| DELETE | /pedidos/:id | 200 excluído; 404 inexistente (extra, usado pela interface) |

### Exemplo

Requisição `POST /pedidos`:

```
{ "cliente": "Carlos Silva", "tipo": "entrega", "valor": 350, "prioridade": "normal" }
```

Resposta 201:

```
{ "id": 1, "cliente": "Carlos Silva", "tipo": "entrega", "valor": 350, "prioridade": "normal", "status": "recebido" }
```

Erros retornam JSON no formato `{ "erro": "mensagem" }`.

## Valores aceitos

- **tipo:** `entrega`, `retirada`
- **prioridade:** `baixa`, `normal`, `alta`
- **status:** `recebido`, `em_preparacao`, `enviado`, `entregue`, `cancelado`

Validações: `cliente` é texto não vazio (após remover espaços); `valor` é número maior que zero; `tipo` e `prioridade` precisam estar nas listas acima.

### Transições de status

- recebido: em_preparacao ou cancelado
- em_preparacao: enviado ou cancelado
- enviado: entregue
- entregue e cancelado: estados finais, não mudam

Transição fora dessas regras retorna 400.

## Arquitetura

Arquitetura em camadas:

- `src/routes`: define as rotas e chama o controller.
- `src/controllers`: recebe a requisição, chama o service e devolve a resposta HTTP.
- `src/services`: regras de negócio, validações, transições de status e armazenamento em memória.
- `src/app.js`: configura o Express e o tratamento centralizado de erros (400 para JSON inválido, erros de validação e 404 vindos do service; qualquer outro erro vira 500).
- `public`: interface web (HTML, CSS e JS) que consome a API.

Os dados ficam em memória, então são perdidos ao reiniciar o servidor.

## Testes

Testes automatizados com Jest e Supertest:

```
npm test
```

Cobrem criação válida (201), cliente vazio, valor menor ou igual a zero, tipo/prioridade inválidos (400), listagem, consulta por ID (200 e 404), atualização de status válida, transição inválida (400) e ID inexistente (404), exclusão e filtros.

Testes manuais com Postman: coleção e capturas na pasta `evidencias/`.

## Uso de IA

Utilizei IA como apoio no desenvolvimento, principalmente na criação da interface web, na rota de exclusão e filtros, e nos testes correspondentes. Revisei e testei o código entregue.

- **Sugestão modificada:** a IA gerou uma interface com quadro Kanban, painel de indicadores e um testador de API embutido. Considerei excessivo para o escopo do trabalho e difícil de justificar, então simplifiquei para um formulário e uma tabela, e removi a rota de metadados `/api`.
- **Sugestão aceita:** manter as regras de transição de status apenas no service, deixando o controller só com a parte HTTP, para respeitar a separação em camadas.
