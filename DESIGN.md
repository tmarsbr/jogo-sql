---
version: alpha
name: SQL Detective
description: Estética cyberpunk/glassmorphism para um jogo educacional de SQL com tema de investigação de fraude.
colors:
  bg-deep: "#0a0e1a"
  bg-surface: "#111827"
  bg-glass: "#1a2332"
  bg-glass-hover: "#212d42"
  border: "#2a3a5c"
  border-glow: "#3d5a8a"
  text: "#e2e8f0"
  text-muted: "#7a8ba8"
  accent: "#00d9ff"
  accent-hover: "#33e5ff"
  accent-glow: "rgba(0, 217, 255, 0.15)"
  success: "#22c55e"
  success-glow: "rgba(34, 197, 94, 0.15)"
  warning: "#fbbf24"
  warning-glow: "rgba(251, 191, 36, 0.15)"
  danger: "#ef4444"
  danger-glow: "rgba(239, 68, 68, 0.15)"
  purple: "#a855f7"
  purple-glow: "rgba(168, 85, 247, 0.15)"
typography:
  h1:
    fontFamily: JetBrains Mono
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.2
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: "0.05em"
    lineHeight: 1
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
components:
  panel:
    backgroundColor: "{colors.bg-glass}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 0
  panel-title:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#0a0e1a"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#0a0e1a"
  button-secondary:
    backgroundColor: "{colors.bg-glass-hover}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "#0a0e1a"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  status-ok:
    backgroundColor: "{colors.success-glow}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
  status-pending:
    backgroundColor: "{colors.warning-glow}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
  status-error:
    backgroundColor: "{colors.danger-glow}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
---

## Overview

SQL Detective usa uma estética cyberpunk com glassmorphism moderado para criar
a atmosfera de investigação de fraude financeira. O tema dark profundo com
acentos neon (ciano, verde, roxo) evoca terminais de hacker e dashboards de
forense digital. A vidraça (glassmorphism) é sutil — backdrop-filter com blur
leve nas superfícies, sem exageros que prejudiquem legibilidade.

## Colors

- **bg-deep (#0a0e1a):** Fundo mais escuro do app, usado no body e overlays.
- **bg-glass (#1a2332):** Superfície dos painéis com leve transparência.
- **accent (#00d9ff):** Ciano neon — cor principal de ação e foco. Lembra terminais.
- **success (#22c55e):** Verde para acertos, evidências e missões concluídas.
- **warning (#fbbf24):** Âmbar para dicas e estados pendentes.
- **danger (#ef4444):** Vermelho para erros e ações destrutivas.
- **purple (#a855f7):** Roxo para detalhes narrativos e diagrama ER.

## Typography

- **JetBrains Mono** no editor SQL e em blocos de código — monoespaçada com
  ligaduras, excelente para SQL.
- **Inter** no resto da interface — sans-serif legível e neutra.
- Carregadas via Google Fonts com fallbacks de sistema.

## Elevation & Depth

- Painéis usam `backdrop-filter: blur(10px)` com fundo semi-transparente
  (`rgba(26, 35, 50, 0.8)`) sobre um gradient de fundo do body.
- Bordas de 1px com cor sutil (`#2a3a5c`) e glow opcional via box-shadow.
- Sombras: `0 4px 24px rgba(0,0,0,0.4)` para modais e overlays.

## Shapes

- Cantos arredondados: 4px (pequeno), 8px (médio), 12px (painéis), 9999px (pills).
- Border-radius consistente em botões, painéis e inputs.

## Components

- **panel**: superfície glassmorphism com blur, borda sutil, scroll interno.
- **button-primary**: ciano sólido, texto escuro, hover com glow.
- **button-secondary**: glass com borda, hover escurece levemente.
- **status pills**: rounded-full com fundo semi-transparente da cor semântica.

## Do's and Don'ts

- **Do** respeitar `prefers-reduced-motion` — desabilitar todas as animações.
- **Do** garantir contraste WCAG AA (4.5:1) em todos os estados.
- **Do** manter o glassmorphism sutil — não usar em mais de 2 níveis de profundidade.
- **Don't** sacrificar legibilidade do SQL por efeitos visuais.
- **Don't** usar animações longas (>400ms) que atrapalhem a interação.
- **Don't** aplicar blur pesado em áreas com tabelas de resultados (performance).