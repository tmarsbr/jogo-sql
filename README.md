# SQL Detective

Autor: Tiago Silva

Jogo web para ensinar SQL por meio de seis investigações conectadas — fraude financeira, vazamento de dados, lavagem com criptoativos, sabotagem de estoque, normalização de uma planilha e construção de um Data Warehouse — e 12 projetos independentes de análise de dados.

Antes das consultas, cada cenário apresenta uma **Etapa 0 — Análise do Banco** com entidades, relacionamentos, decisões de design e checkpoints conceituais. O Caso 005 pratica 1FN, 2FN, 3FN, PKs, FKs e relacionamentos; o Caso 006 cobre limpeza, ETL, star schema, OLAP, índices e auditoria. Os Casos 002, 004 e 006 e a missão 10 dos projetos aplicáveis incluem exercícios de `CREATE VIEW` para produzir relatórios reutilizáveis.

## Licença

Este projeto está disponível sob a [licença MIT](LICENSE). Você pode clonar,
usar, modificar e redistribuir o projeto, mantendo o aviso de copyright de
Tiago Silva.

## Como executar localmente

### Com Node (recomendado)

```bash
cd jogo-sql
npm start
```

Acesse: http://localhost:3000

O servidor Node (`server.js`) serve os arquivos estáticos e implementa o proxy para a API de IA, mantendo a chave do Gemini no ambiente do servidor (nunca no browser).

### Sem Node (fallback estático)

Se você não precisa das dicas de IA, pode servir os arquivos com qualquer servidor estático:

```bash
python3 -m http.server 8000
```

Nesse modo, as dicas de IA ficam indisponíveis e o jogo usa automaticamente as dicas locais estáticas existentes.

## Configuração da IA (opcional)

A IA usa a API do **Google Gemini** (Google AI Studio). A configuração é feita por variáveis de ambiente — nunca no código, no HTML ou no localStorage.

1. Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Edite `.env` e preencha `GEMINI_API_KEY` com sua chave do Google AI Studio. O servidor carrega `.env` automaticamente na inicialização — não é necessário instalar `dotenv` nem exportar variáveis manualmente.

3. Inicie o servidor:

```bash
npm start
```

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `GEMINI_API_KEY` | (vazio) | Chave da API do Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.7-flash` | Modelo principal |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.5-flash` | Modelo reserva quando o principal responde 503 ou estoura o tempo |
| `GEMINI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta` | URL base da API |
| `GEMINI_THINKING_LEVEL` | `low` | Nível de raciocínio do Gemini 3 (`low`, `medium`, `high`; vazio omite o campo) |
| `GEMINI_TIMEOUT_MS` | `25000` | Timeout de cada tentativa |
| `GEMINI_BUDGET_MS` | `60000` | Tempo total somando as tentativas |
| `GEMINI_MAX_HINTS_PER_MINUTE` | `20` | Limite de chamadas de IA por minuto por IP |
| `TRUST_PROXY` | `0` | Se `1`, confia em `X-Forwarded-For` para rate limit (usar apenas atrás de proxy confiável) |

### PowerShell (Windows)

No PowerShell, defina a variável somente na sessão atual antes de `npm start`:

```powershell
$env:GEMINI_API_KEY = "sua-chave-aqui"
npm start
```

Ou use um mecanismo de ambiente local que não seja versionado (como o arquivo `.env`, que está no `.gitignore`).

### Trocar o modelo

Sem mudança de código, basta editar o `.env`:

```dotenv
GEMINI_MODEL=gemini-3.5-flash
GEMINI_FALLBACK_MODEL=gemini-flash-latest
```

### Retentativas e modelo reserva

Modelos recém-lançados costumam responder `503` em picos de demanda. Quando isso acontece (ou quando a
chamada estoura `GEMINI_TIMEOUT_MS`), o servidor tenta o `GEMINI_FALLBACK_MODEL` dentro do orçamento de
tempo definido em `GEMINI_BUDGET_MS`. Se nada responder, o jogo cai na dica local.

## Chat de dúvidas

Depois de revelar a primeira dica, a aba **DICAS** abre um chat com a IA. O jogador escreve a própria
pergunta ("por que preciso de GROUP BY aqui?") e recebe uma explicação contextualizada.

- O contexto enviado é o mesmo das dicas (missão, schema, tentativa atual e dicas já reveladas), mais o
  histórico da conversa (últimas 10 mensagens).
- **As perguntas do chat não consomem dicas nem reduzem estrelas.**
- A resposta passa pela mesma sanitização das dicas: nada de HTML, blocos de código ou consulta pronta.
- Trocar de missão limpa a conversa — o contexto muda por completo.
- Funciona nos modos missão, Construtor de Schema e Bug Hunter; fica indisponível no Boss Fight.

## Comportamento de fallback

- Se a IA não estiver configurada, indisponível, exceder o limite de uso ou demorar demais, o jogo revela automaticamente a próxima dica local estática.
- A interface mostra um aviso não intrusivo indicando que aquela é uma "dica local".
- Cada missão permite no máximo três dicas (sejam de IA ou locais). Uma dica de IA também reduz a pontuação normalmente.
- A IA ensina o próximo passo, sem entregar uma consulta SQL completa nem revelar a query de referência.

## Estrutura do projeto

```
index.html          # Estrutura semântica da SPA
index.css           # Layout de 3 painéis, responsivo, tema dark cyberpunk
server.js           # Servidor Node: estáticos + proxy /api/ai-hint, /api/ai-chat e /api/ai-schema-review
src/
  app.js            # Inicialização e fluxo principal
  state.js          # Estado global da aplicação
  ui.js             # Renderização e eventos da interface
  db.js             # Criação, seed e execução do SQLite (sql.js)
  levels.js         # Caso 001: análise do banco, 12 missões e gameplay
  cases/            # Casos 002–006 e 12 projetos, com schemas e missões próprias
  validator.js      # Validação de resultados e conceitos SQL
  executor.js       # Executor SQL seguro (bloqueia DDL/DML destrutivo)
  scoring.js        # Estrelas e pontuação
  storage.js        # Persistência em localStorage
  course-content.js # Conteúdo didático estruturado do curso
  er-diagram.js     # Geração do diagrama ER em SVG
  ai-hints.js       # Módulo do browser: contexto, chamada e sanitização de dicas de IA
  ai-chat.js        # Módulo do browser: chat de dúvidas com a IA (contexto + histórico)
  ai-schema-review.js # Módulo do browser: revisão do modelo pela IA arquiteta
docs/
  curriculum-map.md # Mapa curricular das aulas do curso
  ollama-ai-hints-plan.md # Plano original das dicas com IA (histórico: provedor anterior)
.env.example        # Template de configuração (sem valores secretos)
.gitignore          # Ignora .env, node_modules e logs
```

## Arquitetura

O projeto usa módulos ES nativos (`type="module"`) sem bundler.

```
browser (index.html / src/app.js)
       │ POST /api/ai-hint · /api/ai-chat, contexto limitado
       ▼
server.js (validação, rate limit, prompt, timeout)
       │ header x-goog-api-key: ***
       ▼
generativelanguage.googleapis.com ──► Gemini (modelo + reserva)
       │ resposta curta, não-streaming
       ▼
painel Dicas e chat (HTML escapado)
```

## Decisões técnicas

- **Sem bundler**: módulos ES nativos, sem build step.
- **Servidor Node opcional**: `server.js` serve estáticos e proxy de IA; sem ele, o jogo funciona com dicas locais.
- **sql.js**: SQLite via WebAssembly.
- **localStorage**: persistência do progresso.
- **Mutações com escopo mínimo**: `CREATE VIEW` é liberado apenas nas missões próprias. `INSERT`, `UPDATE`, `CREATE INDEX` e `CREATE TRIGGER` são aceitos somente nas missões de modelagem e ETL que os exigem. A solução é executada em um savepoint, validada contra o estado de referência e só então persistida.
- **Segurança**: a chave do Gemini nunca é exposta ao browser. O servidor valida entrada, aplica rate limit, timeout e sanitiza a resposta do modelo.

## Status

- [x] Fase 1 — Estrutura mínima da aplicação
- [x] Fase 2 — Banco SQLite e dados da investigação
- [x] Fase 3 — Executor SQL seguro
- [x] Fase 4 — Níveis do MVP e validação
- [x] Fase 5 — Pontuação, dicas e persistência
- [x] Fase 6 — Narrativa e painel de evidências
- [x] Fase 7 — Sandbox e responsividade
- [x] Fase 8 — Missões avançadas
- [x] Fase 9 — Refinamento visual e diagrama ER
- [x] Fase 10 — Integração das transcrições do curso
- [x] Etapa 0 — Normalização, relacionamentos e design por caso
- [x] Missões práticas de CREATE VIEW nos Casos 002, 004 e 006 e na missão 10 dos projetos aplicáveis
- [x] Casos 005 e 006 — Normalização, relacionamentos, ETL, Data Warehouse, OLAP, índices e triggers
- [x] Certificados exportáveis para cenários concluídos
- [x] Dicas com IA via Google Gemini (proxy Node, modelo reserva, fallback local)
- [x] Chat de dúvidas com a IA na aba Dicas (sem custo de estrelas)
