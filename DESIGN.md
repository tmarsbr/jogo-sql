---
version: 1.0.0
name: SQL Detective — Cyber Forensics
description: Estética cyberpunk de alta fidelidade para investigação forense digital e análise de dados em SQL.
colors:
  bg-deep: "#070A11"
  bg-base: "#090D16"
  bg-surface: "rgba(11, 17, 29, 0.72)"
  bg-surface-elevated: "rgba(13, 19, 32, 0.86)"
  bg-glass: "rgba(9, 13, 22, 0.86)"
  border-subtle: "#16223A"
  border-card: "#17243C"
  border-highlight: "#1B2A47"
  text-primary: "#F2F7FF"
  text-body: "#DCE6F2"
  text-table: "#C6D4E6"
  text-muted: "#7D90AD"
  text-subdued: "#5A6E8C"
  text-disabled: "#3F5170"
  accent-cyan: "#00F0FF"
  accent-cyan-hover: "#7DF7FF"
  accent-cyan-glow: "rgba(0, 240, 255, 0.25)"
  accent-purple: "#8B5CF6"
  accent-purple-light: "#A78BFA"
  accent-purple-glow: "rgba(139, 92, 246, 0.25)"
  status-success: "#22C55E"
  status-success-light: "#4ADE80"
  status-success-bg: "rgba(34, 197, 94, 0.08)"
  status-warning: "#FBBF24"
  status-warning-bg: "rgba(251, 191, 36, 0.08)"
  status-danger: "#EF4444"
  status-danger-light: "#FF6B7F"
  status-danger-bg: "rgba(239, 68, 68, 0.09)"
typography:
  font-heading: "'JetBrains Mono', monospace"
  font-body: "'Inter', system-ui, -apple-system, sans-serif"
  font-code: "'JetBrains Mono', monospace"
---

# SQL Detective — Cyber Forensics Design System

O **SQL Detective** adota a direção visual **Cyber Forensics**, combinando terminal de inteligência cibernética, dashboards de investigação forense e visual de alto contraste e legibilidade.

## 1. Paleta de Cores & Superfícies

- **Fundo Base (`#090D16` / `#070A11`)**: Fundo escuro com grade vetorial sutil de 48px e gradientes radiais em ciano e roxo nos cantos.
- **Ciano Neon (`#00F0FF`)**: Acento principal de foco, botões de ação primária, títulos de arquivos, bordas ativas e luzes de status online.
- **Roxo Cyber (`#8B5CF6` / `#A78BFA`)**: Tags conceituais, nós do grafo investigativo, projetos de dados e ligações de chaves estrangeiras (FK).
- **Verde Forense (`#22C55E` / `#4ADE80`)**: Evidências desclassificadas, conexões válidas, banco conectado e inquéritos arquivados.
- **Âmbar (`#FBBF24`)**: Chaves primárias (PK), alertas moderados e pontuação estelar.
- **Vermelho Alerta (`#EF4444` / `#FF6B7F`)**: Badges de *CONFIDENCIAL*, erros de sintaxe SQL e evidências classificadas/bloqueadas.

## 2. Tipografia

- **JetBrains Mono**: Cabeçalhos, rótulos de status em caixa alta com espaçamento largo (`letter-spacing: .16em`), códigos SQL, esquemas de tabelas e contadores.
- **Inter**: Narrativa de inquérito, briefings, descrições conceituais e textos de interface explicativos.

## 3. Componentes & Layout

- **Lobby / Arquivo Central**:
  - Indicador de status pulsante `ARQUIVO CENTRAL · TERMINAL ONLINE`.
  - Cards de métricas rápidas (Investigações, Projetos, Missões).
  - Seletor de abas para alternar entre Casos Policiais e Projetos de Negócios.
  - Cartões com listra neon superior (`#00F0FF` ou roxo) e efeito hover com glow.
- **Dossiê Confidencial**:
  - Modal com efeito de scanner superior animado.
  - Grid de 2 colunas: narrativa à esquerda e metadados forenses estruturados à direita.
- **Etapa 0 (Análise do Banco)**:
  - Mapa de entidades com badges de sensibilidade (`PII`, `SIGILOSO`, `AUDITORIA`) e relações FK.
  - Cartões de decisões de modelagem e missões conceituais em `<details>`.
- **Inquérito (Console Principal)**:
  - Header fixo com barra de progresso em gradiente contínuo e status do banco.
  - Rail vertical de missões 1..12 para navegação e visão geral de conclusão.
  - Briefing com pills de conceito e caixa de objetivo com borda iluminada.
  - Editor `QUERY.SQL` com botão `EXECUTAR` em neon e atalho `Ctrl+Enter`.
  - Painel Investigativo com abas (`EVIDÊNCIAS`, `REDE`, `TEMPO`, `SUSPEITOS`, `DICAS`):
    - Evidências desclassificadas vs classificadas com desfoque (*blur*).
    - Grafo SVG interativo com glow em nós ativos.
    - Linha do tempo com badges de evento e controle de reordenação.
    - Medidor de suspeita e acesso à sala de interrogatório.
    - Canal de dicas com assistente IA forense.