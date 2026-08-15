# SQL Detective

Autor: Tiago Silva

Jogo web para ensinar SQL por meio de quatro investigações conectadas — fraude financeira, vazamento de dados, lavagem com criptoativos e sabotagem de estoque — e 12 projetos independentes de análise de dados.

Antes das consultas, cada cenário apresenta uma **Etapa 0 — Análise do Banco** com entidades, relacionamentos, decisões de design e checkpoints conceituais. O Caso 001 introduz normalização de forma explícita. Os Casos 002 e 004 e a missão 10 dos projetos de E-Commerce, Vendas, Logística, Educação, Financeiro e Setor Público terminam com exercícios práticos de `CREATE VIEW` para produzir relatórios reutilizáveis.

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

O servidor Node (`server.js`) serve os arquivos estáticos e implementa o proxy para a API de dicas com IA, mantendo a chave do Ollama no ambiente do servidor (nunca no browser).

### Sem Node (fallback estático)

Se você não precisa das dicas de IA, pode servir os arquivos com qualquer servidor estático:

```bash
python3 -m http.server 8000
```

Nesse modo, as dicas de IA ficam indisponíveis e o jogo usa automaticamente as dicas locais estáticas existentes.

## Configuração das dicas de IA (opcional)

As dicas de IA usam o Ollama Cloud (ou um Ollama local). A configuração é feita por variáveis de ambiente — nunca no código, no HTML ou no localStorage.

1. Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Edite `.env` e preencha `OLLAMA_API_KEY` com sua chave do Ollama Cloud. O servidor carrega `.env` automaticamente na inicialização — não é necessário instalar `dotenv` nem exportar variáveis manualmente.

3. Inicie o servidor:

```bash
npm start
```

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `OLLAMA_BASE_URL` | `https://ollama.com/api` | URL base da API do Ollama |
| `OLLAMA_API_KEY` | (vazio) | Chave Bearer do Ollama Cloud |
| `OLLAMA_MODEL` | `gpt-oss:120b` | Modelo usado para gerar dicas |
| `OLLAMA_TIMEOUT_MS` | `20000` | Timeout da chamada ao modelo |
| `OLLAMA_MAX_HINTS_PER_MINUTE` | `12` | Limite de dicas por minuto por IP |
| `TRUST_PROXY` | `0` | Se `1`, confia em `X-Forwarded-For` para rate limit (usar apenas atrás de proxy confiável) |

### Ollama local (sem chave)

Para desenvolvimento local com um Ollama rodando em `localhost:11434`:

```dotenv
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_API_KEY=
```

Nesse modo, a chave pode ficar vazia — o servidor ainda é usado como proxy same-origin.

### PowerShell (Windows)

No PowerShell, defina a variável somente na sessão atual antes de `npm start`:

```powershell
$env:OLLAMA_API_KEY = "sua-chave-aqui"
npm start
```

Ou use um mecanismo de ambiente local que não seja versionado (como o arquivo `.env`, que está no `.gitignore`).

### Trocar o modelo

Para reduzir latência, troque para `deepseek-v4-flash` sem mudança de código:

```dotenv
OLLAMA_MODEL=deepseek-v4-flash
```

## Comportamento de fallback

- Se a IA não estiver configurada, indisponível, exceder o limite de uso ou demorar demais, o jogo revela automaticamente a próxima dica local estática.
- A interface mostra um aviso não intrusivo indicando que aquela é uma "dica local".
- Cada missão permite no máximo três dicas (sejam de IA ou locais). Uma dica de IA também reduz a pontuação normalmente.
- A IA ensina o próximo passo, sem entregar uma consulta SQL completa nem revelar a query de referência.

## Estrutura do projeto

```
index.html          # Estrutura semântica da SPA
index.css           # Layout de 3 painéis, responsivo, tema dark cyberpunk
server.js           # Servidor Node: estáticos + proxy POST /api/ai-hint
src/
  app.js            # Inicialização e fluxo principal
  state.js          # Estado global da aplicação
  ui.js             # Renderização e eventos da interface
  db.js             # Criação, seed e execução do SQLite (sql.js)
  levels.js         # Caso 001: análise do banco, 12 missões e gameplay
  cases/            # Casos 002–004 e 12 projetos, com schemas e missões próprias
  validator.js      # Validação de resultados e conceitos SQL
  executor.js       # Executor SQL seguro (bloqueia DDL/DML destrutivo)
  scoring.js        # Estrelas e pontuação
  storage.js        # Persistência em localStorage
  course-content.js # Conteúdo didático estruturado do curso
  er-diagram.js     # Geração do diagrama ER em SVG
  ai-hints.js       # Módulo do browser: contexto, chamada e sanitização de dicas de IA
docs/
  curriculum-map.md # Mapa curricular das aulas do curso
  ollama-ai-hints-plan.md # Plano de implementação das dicas com IA
.env.example        # Template de configuração (sem valores secretos)
.gitignore          # Ignora .env, node_modules e logs
```

## Arquitetura

O projeto usa módulos ES nativos (`type="module"`) sem bundler.

```
browser (index.html / src/app.js)
       │ POST /api/ai-hint, contexto limitado
       ▼
server.js (validação, rate limit, prompt, timeout)
       │ Authorization: Bearer ***
       ▼
https://ollama.com/api/chat ──► modelo configurado
       │ resposta curta, não-streaming
       ▼
painel Dicas (HTML escapado)
```

## Decisões técnicas

- **Sem bundler**: módulos ES nativos, sem build step.
- **Servidor Node opcional**: `server.js` serve estáticos e proxy de IA; sem ele, o jogo funciona com dicas locais.
- **sql.js**: SQLite via WebAssembly.
- **localStorage**: persistência do progresso.
- **DDL com escopo mínimo**: `CREATE VIEW` só é liberado nas missões próprias dos Casos 002 e 004 e na missão 10 dos projetos aplicáveis; nome, conteúdo e prévia da view são validados. Os demais DDLs continuam bloqueados.
- **Segurança**: a chave do Ollama nunca é exposta ao browser. O servidor valida entrada, aplica rate limit, timeout e sanitiza a resposta do modelo.

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
- [x] Missões práticas de CREATE VIEW nos Casos 002 e 004 e na missão 10 dos projetos aplicáveis
- [x] Dicas com IA via Ollama Cloud (proxy Node, fallback local)
