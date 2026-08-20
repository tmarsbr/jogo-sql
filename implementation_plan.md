# Aplicar Diagrama ER v2 Interativo

Substituir o diagrama ER estático (SVG simples com curvas Bezier) pelo design interativo do protótipo `Diagrama ER v2.dc.html`. O novo diagrama será renderizado em HTML/DOM com canvas interativo.

## Features do v2 a Implementar

| Feature | Descrição |
|---|---|
| **Canvas interativo** | Zoom (roda do mouse), pan (arrastar fundo), drag de tabelas |
| **Roteamento ortogonal** | Linhas em ângulo reto com cantos arredondados (não mais curvas Bezier) |
| **Cardinalidade** | Labels `(1,1)` e `(0,n)` nas pontas dos relacionamentos |
| **Badges PK/FK** | Badges coloridos nas colunas (amarelo PK, roxo FK, misto PK·FK) |
| **Seleção de tabela** | Clique na tabela isola ela e suas vizinhas, dimming do resto |
| **Hover tooltip** | Ao passar o mouse numa relação, mostra SQL da FK e cardinalidade |
| **Zoom controls** | Botões −/+, label percentual, botão AJUSTAR e RESETAR LAYOUT |
| **Legenda** | Barra inferior com ícones de PK, FK, lado FK (ponto cheio), lado PK (ponto vazio) |
| **Schema dinâmico** | Usa `getSchemaDetailed()` do banco ativo para gerar tabelas e relações |

## Proposed Changes

### Módulo ER Diagram

#### [MODIFY] [er-diagram.js](file:///c:/Users/tiago/Área de Trabalho/meus cursos/jogo-sql/src/er-diagram.js)

Reescrita completa do módulo. As mudanças principais:

1. **Manter as exports existentes** (`renderERDiagram`, `getERTables`, `getERRelations`, `generateERDiagramSVG`) para não quebrar nenhuma chamada.
2. **`renderERDiagram(container)`** — agora renderiza o diagrama interativo em DOM (HTML divs + SVG para linhas) em vez de SVG puro.
3. **Motor de layout** — `computeLayout()` com grid automático, posições absolutas, offsets de drag.
4. **Motor de relações** — `buildRelations()` com roteamento ortogonal (linhas em ângulo reto com `roundedPath()`), lanes para evitar sobreposição.
5. **Interações** — zoom (wheel), pan (drag fundo), drag tabelas, click para isolar, hover tooltip nas linhas.
6. **Estado interno** — um objeto de estado por instância do diagrama (zoom, offsets, seleção, hover, tooltip).
7. **Schema dinâmico** — usa `getSchemaDetailed()` para pegar tabelas e FK do banco ativo, com fallback para a definição estática do caso 001.
8. **Detecção de FK** — extrai automaticamente relações a partir das FK das colunas (`column.fk = 'tabela.coluna'`).

---

### CSS

#### [MODIFY] [index.css](file:///c:/Users/tiago/Área de Trabalho/meus cursos/jogo-sql/index.css)

Atualizar/adicionar estilos para o novo diagrama:

- `.erd-canvas` — container com overflow auto, cursor grab, borda/background
- `.erd-world` — div posicionada absolutamente com `transform: scale(zoom)`
- `.erd-table` — card da tabela com borda, shadow, border-radius
- `.erd-table-header` — header cyan com borda left accent
- `.erd-table-col` — linha de coluna com separadores
- `.erd-badge-pk`, `.erd-badge-fk`, `.erd-badge-pkfk` — badges coloridos
- `.erd-controls` — barra de zoom
- `.erd-legend` — legenda inferior (reutiliza/evolui a existente)
- `.erd-tooltip` — tooltip fixo de hover nas relações
- Transições de opacidade para dimming
- Glow de seleção

## Verificação

### Manual Verification
- Abrir o jogo no browser, navegar para uma aba com diagrama ER
- Verificar zoom in/out com roda e botões
- Verificar drag de tabelas
- Verificar pan do fundo
- Verificar clique para isolar tabela
- Verificar hover tooltip nas linhas
- Verificar que o diagrama funciona tanto no modal quanto no sidebar
- Verificar que o schema dinâmico (modo construtor) funciona
