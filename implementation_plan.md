# Plano de implementação — gameplay investigativo do Caso #001

## Objetivo

Adicionar ao Caso #001 do **SQL Detective** três mecânicas que reforçam a investigação sem alterar o conteúdo pedagógico das missões:

1. Linha do tempo de evidências, com bônus único de +200 pontos.
2. Medidor de suspeita, calculado a partir das evidências já descobertas.
3. Interrogatório final de Camila Torres após a conclusão correta da Missão 12.

O resultado precisa funcionar em desktop e celular, preservar saves existentes e não liberar o Caso #002 antes da resolução do interrogatório.

## Decisões de produto e escopo

| Tema | Decisão |
| --- | --- |
| Escopo inicial | Implementar somente o Caso #001. A arquitetura deve aceitar `GAMEPLAY` em qualquer caso futuro; os Casos #002–#004 continuam com o encerramento atual. |
| Linha do tempo | Na primeira versão, usar botões “subir” e “descer”. É acessível por teclado e funciona em telas touch. Drag-and-drop fica fora do escopo. |
| Pontuação | A linha do tempo concede +200 pontos uma única vez por caso. Reordenar depois não concede pontos novamente. |
| Suspeitos | Exibir apenas pessoas de interesse sustentadas pela evidência. Antes da Missão 5, usar “Pessoa de interesse #7”, nunca revelar que é Camila. Não introduzir nomes ou fatos que as missões ainda não revelaram. |
| Interrogatório | É obrigatório para encerrar o Caso #001. A query correta da Missão 12 inicia o confronto; o modal genérico de conclusão só aparece após vencê-lo. |
| Conteúdo visual | Usar CSS e elementos HTML existentes. Não adicionar dependências, imagens externas, bibliotecas de drag-and-drop ou um bundler. |

## Contexto confirmado no repositório

- O jogo é uma SPA com módulos ES nativos, sem framework de UI.
- O progresso é isolado por caso em `state.progressByCase` e persistido em `localStorage` pela chave `sql_detective_v2`.
- O Caso #001 tem 12 missões; os Casos #002–#004 têm fluxos e bases próprias.
- Hoje, acertar a Missão 12 abre diretamente o modal de conclusão e libera o caso seguinte. Esse fluxo precisa ser condicionado ao interrogatório.
- A suíte usa scripts Node sem framework de testes. Novos testes devem seguir esse padrão e ser incluídos em `npm test`.
- A base já contém os fatos da cronologia. Não alterar `src/db.js` nem os dados da investigação para esta funcionalidade.

## Dados narrativos canônicos

Os eventos abaixo devem ficar em `src/levels.js`, em uma exportação de configuração do Caso #001. O campo `unlockedByMission` evita que a interface revele uma pista antes da missão que a apresenta. `sortKey` é uma data ISO apenas para a lógica; a tela pode mostrar o horário que já foi descoberto pelo jogador.

| id | Desbloqueio | sortKey | Tipo | Rótulo inicial |
| --- | ---: | --- | --- | --- |
| `email-801` | 9 | `2024-03-11T21:00:00` | e-mail | Pedido urgente enviado |
| `access-701` | 4 | `2024-03-12T22:30:00` | acesso | Acesso noturno ao Financeiro |
| `transfer-501` | 3 | `2024-03-12T23:15:00` | transação | Transferência de alto valor |
| `email-802` | 9 | `2024-03-14T20:30:00` | e-mail | Mensagem sobre transferência ponte |
| `access-702` | 4 | `2024-03-15T22:10:00` | acesso | Acesso noturno à Tesouraria |
| `transfer-502` | 3 | `2024-03-15T22:45:00` | transação | Transferência de alto valor |
| `access-703` | 4 | `2024-03-18T23:00:00` | acesso | Acesso noturno ao Financeiro |
| `transfer-503` | 3 | `2024-03-18T23:30:00` | transação | Transferência de alto valor |
| `transfer-504` | 3 | `2024-03-22T01:10:00` | transação | Transferência de alto valor |

O medidor é derivado, e não acumulado por cliques. Com base em `completedLevels`, ele soma os deltas declarados em cada missão e limita o valor ao intervalo de 0 a 100. Assim, recarregar a página ou refazer uma query nunca duplica a suspeita.

Regras narrativas mínimas:

- Missão 2: apresenta o grupo Financeiro como contexto, sem acusar ninguém.
- Missão 4: eleva a suspeita de `pessoa-07` e `pessoa-04`; ambas ainda usam apelidos neutros.
- Missão 5: revela que `pessoa-07` é Camila Torres e aumenta sua suspeita.
- Missões 6, 7, 9, 10, 11 e 12 reforçam apenas evidências já obtidas contra Camila, fechando em 100.
- A pessoa `pessoa-04` permanece uma pista alternativa de baixa suspeita. Não inventar acusação contra Daniela ou Diego sem uma missão que revele a evidência correspondente.

O interrogatório terá três contradições, nesta ordem, e só aceitará a evidência correta já desbloqueada:

1. “Não houve transferência irregular.” → `transfer-501`
2. “Nunca acessei o sistema fora do horário.” → `access-701`
3. “Nunca pedi que o pagamento fosse escondido.” → `email-801`

Uma evidência errada deve produzir feedback, sem reduzir tentativa, pontuação ou progresso. Uma evidência correta avança exatamente uma etapa. Ao vencer a terceira etapa, o Caso #001 é encerrado.

## Contratos técnicos

### Configuração por caso

Em `src/levels.js`, exportar `GAMEPLAY` sem misturar lógica de DOM aos níveis. O formato deve ser suficiente para casos futuros:

```js
export const GAMEPLAY = {
  timeline: {
    bonusPoints: 200,
    events: [{ id, unlockedByMission, sortKey, type, label }],
  },
  suspects: {
    profiles: [{ id, initialLabel, revealedLabel, revealAtMission }],
    deltasByMission: { 4: [{ suspectId: 'pessoa-07', delta: 25 }] },
  },
  finalChallenge: {
    type: 'interrogation',
    suspectName: 'Camila Torres',
    requiredMission: 12,
    steps: [{ statement, evidenceId, successMessage }],
  },
};
```

`case-manager.js` já propaga as exportações de cada módulo de níveis para a definição do caso. Por isso, `activeCase.GAMEPLAY` será disponível no Caso #001 e `undefined` nos demais, preservando o comportamento legado.

### Estado e persistência

Ampliar apenas o progresso de cada caso criado por `createCaseProgress()`:

```js
{
  timelineOrder: [],            // IDs, na ordem escolhida pelo jogador
  timelineBonusAwarded: false,
  bonusPoints: 0,
  interrogation: {
    status: 'locked',           // locked | active | won
    stepIndex: 0,
    presentedEvidenceIds: [],
  },
}
```

Não persistir o valor do medidor de suspeita: ele é obtido de `completedLevels` e da configuração estática. A UI pode manter apenas uma variável temporária de animação, nunca a fonte de verdade.

Em `src/storage.js`:

- Manter a chave `sql_detective_v2`: o formato é aditivo e saves antigos devem receber os valores padrão.
- Estender `getDefaultCaseProgress`, `validateCaseProgress`, `hasProgress` e `serializeState` para os novos campos.
- Validar tipos, limites e enums; deduplicar IDs de arrays. A normalização da timeline deve também descartar IDs não pertencentes à configuração ativa antes de renderizar.
- Preservar o isolamento entre casos e a migração v1 → v2 já existente.

Em `src/scoring.js`, fazer `calculateTotalScore(levelProgress, bonusPoints = 0)` incluir o bônus validado. O valor padrão mantém todos os chamadores e testes atuais compatíveis. Nunca alterar as estrelas obtidas em uma missão.

## Módulos novos — lógica pura e testável

### `src/timeline.js`

Exportar funções puras para:

- obter eventos desbloqueados a partir de `completedLevels`;
- normalizar a ordem, mantendo IDs válidos únicos e acrescentando eventos recém-desbloqueados no fim;
- mover um evento para cima/baixo sem mutar o array de origem;
- validar ordem cronológica exata pelo `sortKey`;
- retornar uma transição de bônus idempotente (`awarded`, `bonusPoints`, `message`).

O módulo não deve acessar `document`, `localStorage` ou `state`.

### `src/suspect-meter.js`

Exportar funções puras para derivar os percentuais, limitar o resultado entre 0 e 100 e escolher o rótulo seguro de cada perfil conforme as missões concluídas. O retorno deve ser determinístico para o mesmo conjunto de missões.

### `src/interrogation.js`

Exportar funções puras para criar/normalizar estado, verificar disponibilidade, iniciar o confronto e apresentar uma evidência. A função de apresentação deve retornar um objeto explícito, por exemplo:

```js
{ accepted: false, reason: 'wrong_evidence', state }
{ accepted: true, completed: false, state }
{ accepted: true, completed: true, state: { status: 'won', ... } }
```

Não aceitar evidências que não estejam desbloqueadas; nunca usar o texto livre da evidência como identificador.

## Plano de execução para o Hermes

### H0 — Baseline e isolamento de testes

1. Executar `npm test` antes de alterar as mecânicas e registrar o resultado.
2. Corrigir o isolamento de `test/test_server.js`: atualmente o teste “sem chave no cloud” falha quando existe `.env`, pois `server.js` recarrega a chave ao ser importado. Carregar `.env` somente no caminho de execução do servidor (`require.main === module`) ou introduzir uma injeção explícita de configuração para os testes. Não ler, exibir ou versionar valores secretos.
3. Confirmar que `npm test` passa antes de iniciar H1. Essa correção é pequena e independente do gameplay.

### H1 — Escrever os testes de domínio antes da integração

1. Criar `test/test_timeline.js`, `test/test_suspect_meter.js` e `test/test_interrogation.js` no mesmo estilo de assertions da suíte atual.
2. Estender `test/helpers/load-source.js` com carregadores para os três módulos puros, se necessário.
3. Incluir os três arquivos no script `npm test`.
4. Cobrir, no mínimo:
   - eventos são desbloqueados somente pela missão correta;
   - ordem incompleta, duplicada ou adulterada não gera bônus;
   - ordem correta gera +200 apenas uma vez, inclusive após uma simulação de reload;
   - o medidor é determinístico, limitado a 0–100 e não revela Camila antes da Missão 5;
   - o interrogatório fica bloqueado antes da Missão 12; prova errada não avança; cada prova correta avança uma etapa; só a terceira encerra o caso.

### H2 — Dados, domínio e persistência

1. Implementar `GAMEPLAY` no Caso #001 usando exclusivamente os dados narrativos desta especificação.
2. Implementar os três módulos puros até os testes de H1 passarem.
3. Atualizar `state.js`, `storage.js` e `scoring.js` conforme os contratos acima.
4. Estender `test/test_storage.js` para provar que um save antigo sem os campos novos é carregado com defaults e que dois casos não compartilham timeline, bônus ou interrogatório.
5. Estender `test/test_scoring.js` para o bônus opcional e para a compatibilidade sem bônus.

### H3 — Integração com o fluxo de jogo

1. Em `app.js`, após uma missão correta, normalizar a timeline, derivar e renderizar o medidor, recalcular a pontuação com o bônus e persistir uma única vez.
2. Ao completar a Missão 12 do Caso #001, iniciar ou retomar o interrogatório em vez de abrir o modal genérico de conclusão.
3. Permitir retomar um save que já possua as 12 missões concluídas, mas cujo interrogatório esteja pendente, por meio de um botão explícito “Iniciar interrogatório”. Não exigir que a query seja refeita.
4. Atualizar `isCaseComplete` em `case-manager.js`: casos sem `finalChallenge` usam a regra atual; o Caso #001 só é completo quando todas as missões foram concluídas **e** `interrogation.status === 'won'`.
5. Só chamar `showConclusionModal` após a vitória. Ao fim, atualizar a seleção de casos para refletir o desbloqueio do Caso #002.

### H4 — Interface, responsividade e acessibilidade

1. Em `index.html`, adicionar:
   - um bloco de Linha do tempo e Medidor de suspeita no painel lateral;
   - um modal de interrogatório com cabeçalho, fala atual, lista de evidências e área de feedback.
2. Em `ui.js`, acrescentar funções de renderização e delegar eventos por `data-*`; manter a lógica de regras nos módulos puros.
3. Em `index.css`, criar estilos compatíveis com o tema atual. Em largura pequena, os cartões devem ter área de toque de pelo menos 44 px e não devem transbordar horizontalmente.
4. Usar `<button type="button">` para mover eventos e apresentar provas. O modal deve ter `role="dialog"`, `aria-modal="true"`, rótulo acessível, foco inicial e suporte a Escape/fechar quando isso não permitir burlar o desafio.
5. Renderizar dados configuráveis usando `textContent` ou `escapeHtml`; não concatenar conteúdo de usuário em `innerHTML`.

### H5 — Revisão final de qualidade

1. Executar `npm test` completo; não aceitar regressões.
2. Subir `npm start` e testar no navegador em desktop e em viewport de 375 px.
3. Fazer a verificação manual abaixo e registrar o resultado no resumo final.
4. Revisar o diff para remover logs de depuração, segredos, mudanças em `node_modules` e alterações não relacionadas.

## Checklist de aceitação manual

- Novo jogo do Caso #001: nenhum evento, bônus ou interrogatório aparece indevidamente.
- Após as Missões 3, 4 e 9: a timeline recebe apenas seus eventos correspondentes; cartas novas não apagam a ordem já escolhida.
- Uma ordem incorreta informa o erro sem pontos; a ordem correta concede +200 uma vez; refresh não duplica a pontuação.
- Antes da Missão 5, a tela não associa “Pessoa de interesse #7” a Camila Torres.
- Trocar de caso e voltar preserva o estado individual de cada caso; Casos #002–#004 não exibem a nova mecânica vazia.
- Após acertar a Missão 12: o interrogatório abre; uma prova errada não avança; as três provas corretas levam ao encerramento.
- Antes de vencer o interrogatório, o Caso #002 permanece bloqueado. Depois, aparece como disponível na tela de casos.
- Teclado: botões da timeline e provas são utilizáveis, foco do modal é visível e não há armadilha de foco.
- Mobile: não há rolagem horizontal e os controles permanecem alcançáveis.

## Fora do escopo desta entrega

- Drag-and-drop, áudio, sprites/arte de personagens, geração de imagens e animações complexas.
- Alterar missões, queries de referência, banco SQLite ou dados de seed.
- Aplicar automaticamente a mecânica aos Casos #002–#004.
- Penalizar tentativas erradas, remover estrelas ou reduzir a pontuação por erros.

## Entrega esperada do Hermes

Ao concluir, o Hermes deve informar: arquivos modificados, comportamento entregue, resultado de `npm test`, resultado do checklist manual e limitações restantes. Depois dessa entrega, a revisão deve conferir principalmente: isolamento entre casos, não repetição de bônus, ausência de spoilers precoces, persistência retrocompatível e o bloqueio correto do Caso #002.
