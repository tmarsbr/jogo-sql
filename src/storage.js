/** Persistencia versionada do SQL Detective com progresso independente por caso. */
const STORAGE_KEY = 'sql_detective_v2';
const LEGACY_STORAGE_KEY = 'sql_detective_v1';
const KNOWN_CASE_IDS = new Set([
  'case001',
  'case002',
  'case003',
  'case004',
  'proj-ecommerce',
  'proj-clientes',
  'proj-vendas',
  'proj-marketing',
  'proj-logistica',
  'proj-estoque',
  'proj-educacao',
  'proj-saude',
  'proj-financeiro',
  'proj-suporte',
  'proj-publico',
  'proj-futebol',
  'case005',
  'case006',
  'bug-hunter',
  'schema-builder',
]);

function getDefaultCaseProgress() {
  return {
    currentLevel: null, completedLevels: [], levelProgress: {}, score: 0, evidence: [],
    timelineOrder: [],
    timelineBonusAwarded: false,
    bonusPoints: 0,
    interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    lessonsRead: [],
    schemaBuilderDdl: {},
    completedAt: null,
    bossFight: {},
  };
}

export function getDefaultState() {
  const case001 = getDefaultCaseProgress();
  const bugHunter = getDefaultCaseProgress();
  const schemaBuilder = getDefaultCaseProgress();
  return { currentCase: 'case001', progressByCase: { case001, 'bug-hunter': bugHunter, 'schema-builder': schemaBuilder }, bossByCase: {}, ...case001 };
}

function isLocalStorageAvailable() {
  try {
    const probe = '__sql_detective_test__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return true;
  } catch { return false; }
}

function validateCaseProgress(data) {
  const result = getDefaultCaseProgress();
  if (!data || typeof data !== 'object' || Array.isArray(data)) return result;
  if (data.currentLevel === null || (Number.isInteger(data.currentLevel) && data.currentLevel >= 1)) {
    result.currentLevel = data.currentLevel;
  }
  if (Array.isArray(data.completedLevels)) {
    result.completedLevels = [...new Set(data.completedLevels.filter(level => Number.isInteger(level) && level >= 1))];
  }
  if (data.levelProgress && typeof data.levelProgress === 'object' && !Array.isArray(data.levelProgress)) {
    for (const key of Object.keys(data.levelProgress)) {
      const entry = data.levelProgress[key];
      if (entry && typeof entry === 'object' && typeof entry.stars === 'number') {
        // Preserva o DDL acumulado do modo Construtor de Schema (opcional).
        let schemaBuilderEntry = null;
        if (entry.schemaBuilder && typeof entry.schemaBuilder === 'object' && Array.isArray(entry.schemaBuilder.ddl)) {
          const ddl = entry.schemaBuilder.ddl.filter(item => typeof item === 'string');
          if (ddl.length > 0) schemaBuilderEntry = { ddl };
        }
        const levelEntry = { stars: entry.stars, hintsUsed: typeof entry.hintsUsed === 'number' ? entry.hintsUsed : 0 };
        if (schemaBuilderEntry) levelEntry.schemaBuilder = schemaBuilderEntry;
        result.levelProgress[key] = levelEntry;
      }
    }
  }
  if (typeof data.score === 'number') result.score = data.score;
  if (Array.isArray(data.evidence)) result.evidence = data.evidence.filter(item => typeof item === 'string');

  // --- Gameplay: timeline ---
  if (Array.isArray(data.timelineOrder)) {
    result.timelineOrder = data.timelineOrder.filter(id => typeof id === 'string');
  }
  if (typeof data.timelineBonusAwarded === 'boolean') result.timelineBonusAwarded = data.timelineBonusAwarded;
  if (typeof data.bonusPoints === 'number' && data.bonusPoints >= 0) result.bonusPoints = data.bonusPoints;

  // --- Gameplay: interrogation ---
  if (data.interrogation && typeof data.interrogation === 'object' && !Array.isArray(data.interrogation)) {
    const inter = data.interrogation;
    const status = ['locked', 'active', 'won'].includes(inter.status) ? inter.status : 'locked';
    const stepIndex = Number.isInteger(inter.stepIndex) ? inter.stepIndex : 0;
    const presentedEvidenceIds = Array.isArray(inter.presentedEvidenceIds)
      ? [...new Set(inter.presentedEvidenceIds.filter(id => typeof id === 'string'))]
      : [];
    result.interrogation = { status, stepIndex, presentedEvidenceIds };
  }

  // --- Aulas lidas ---
  if (Array.isArray(data.lessonsRead)) {
    result.lessonsRead = [...new Set(data.lessonsRead.filter(id => typeof id === 'string'))];
  }

  // --- Modo Construtor de Schema: DDL acumulado por nível ---
  if (data.schemaBuilderDdl && typeof data.schemaBuilderDdl === 'object' && !Array.isArray(data.schemaBuilderDdl)) {
    for (const key of Object.keys(data.schemaBuilderDdl)) {
      const ddl = Array.isArray(data.schemaBuilderDdl[key])
        ? data.schemaBuilderDdl[key].filter(item => typeof item === 'string')
        : [];
      if (ddl.length > 0) result.schemaBuilderDdl[key] = ddl;
    }
  }
  if (!result.schemaBuilderDdl) result.schemaBuilderDdl = {};

  if (typeof data.completedAt === 'string' && Number.isFinite(Date.parse(data.completedAt))) {
    result.completedAt = new Date(data.completedAt).toISOString();
  }

  // --- Gameplay: boss fight (estado de batalha por caso) ---
  if (data.bossFight && typeof data.bossFight === 'object' && !Array.isArray(data.bossFight)) {
    for (const key of Object.keys(data.bossFight)) {
      if (typeof key !== 'string') continue;
      const bf = data.bossFight[key];
      if (!bf || typeof bf !== 'object' || Array.isArray(bf)) continue;
      const status = ['available', 'active', 'won'].includes(bf.status) ? bf.status : 'available';
      const startedAt = typeof bf.startedAt === 'string' && Number.isFinite(Date.parse(bf.startedAt))
        ? new Date(bf.startedAt).toISOString() : null;
      const timerElapsedMs = Number.isInteger(bf.timerElapsedMs) && bf.timerElapsedMs >= 0 ? bf.timerElapsedMs : 0;
      const executionAttempts = Number.isInteger(bf.executionAttempts) && bf.executionAttempts >= 0 ? bf.executionAttempts : 0;
      const sqlErrors = Number.isInteger(bf.sqlErrors) && bf.sqlErrors >= 0 ? bf.sqlErrors : 0;
      const completedSteps = Array.isArray(bf.completedSteps)
        ? [...new Set(bf.completedSteps.filter(id => typeof id === 'string'))]
        : [];
      const scoreAwarded = Number.isInteger(bf.scoreAwarded) ? bf.scoreAwarded : null;
      const completedAt = typeof bf.completedAt === 'string' && Number.isFinite(Date.parse(bf.completedAt))
        ? new Date(bf.completedAt).toISOString() : null;
      result.bossFight[key] = { status, startedAt, timerElapsedMs, executionAttempts, sqlErrors, completedSteps, scoreAwarded, completedAt };
    }
  }
  if (!result.bossFight) result.bossFight = {};

  return result;
}

function normalizeState(data) {
  const defaults = getDefaultState();
  if (!data || typeof data !== 'object' || Array.isArray(data)) return defaults;
  const progressByCase = {};
  if (data.progressByCase && typeof data.progressByCase === 'object' && !Array.isArray(data.progressByCase)) {
    for (const caseId of Object.keys(data.progressByCase)) {
      if (KNOWN_CASE_IDS.has(caseId)) progressByCase[caseId] = validateCaseProgress(data.progressByCase[caseId]);
    }
  }
  // O formato v1 colocava diretamente aqui o progresso do Caso #001.
  if (!progressByCase.case001) progressByCase.case001 = validateCaseProgress(data);
  const currentCase = typeof data.currentCase === 'string' && KNOWN_CASE_IDS.has(data.currentCase) ? data.currentCase : 'case001';
  if (!progressByCase[currentCase]) progressByCase[currentCase] = getDefaultCaseProgress();
  // Gameplay: estado das batalhas de boss por caso (nível superior do estado).
  const bossByCase = {};
  if (data.bossByCase && typeof data.bossByCase === 'object' && !Array.isArray(data.bossByCase)) {
    for (const caseId of Object.keys(data.bossByCase)) {
      const bf = data.bossByCase[caseId];
      if (bf && typeof bf === 'object' && !Array.isArray(bf)) {
        bossByCase[caseId] = validateCaseProgress({ bossFight: { [caseId]: bf } }).bossFight[caseId] || null;
      }
    }
  }
  return { currentCase, progressByCase, bossByCase, ...progressByCase[currentCase] };
}

function hasProgress(progress) {
  return Boolean(progress && (
    progress.currentLevel !== null
    || (progress.completedLevels && progress.completedLevels.length > 0)
    || (progress.levelProgress && Object.keys(progress.levelProgress).length > 0)
    || progress.score !== 0
    || (progress.evidence && progress.evidence.length > 0)
    || (progress.timelineOrder && progress.timelineOrder.length > 0)
    || progress.timelineBonusAwarded
    || progress.bonusPoints > 0
    || (progress.interrogation && progress.interrogation.status !== 'locked')
    || (progress.lessonsRead && progress.lessonsRead.length > 0)
    || progress.completedAt !== null
    || (progress.bossFight && typeof progress.bossFight === 'object'
        && Object.values(progress.bossFight).some(bf => bf && bf.status !== 'available'))
  ));
}

function parseStoredState(raw, legacy = false) {
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    return legacy
      ? normalizeState({ currentCase: 'case001', progressByCase: { case001: parsed } })
      : normalizeState(parsed);
  } catch (error) {
    console.warn('Progresso corrompido - ignorando chave invalida:', error);
    return null;
  }
}

function serializeState(stateData) {
  const normalized = normalizeState(stateData);
  const hasActiveMirror = ['currentLevel', 'completedLevels', 'levelProgress', 'score', 'evidence']
    .some(key => Object.prototype.hasOwnProperty.call(stateData, key));
  if (hasActiveMirror) {
    normalized.progressByCase[normalized.currentCase] = validateCaseProgress({
      currentLevel: stateData.currentLevel,
      completedLevels: stateData.completedLevels,
      levelProgress: stateData.levelProgress,
      score: stateData.score,
      evidence: stateData.evidence,
      timelineOrder: stateData.timelineOrder,
      timelineBonusAwarded: stateData.timelineBonusAwarded,
      bonusPoints: stateData.bonusPoints,
      interrogation: stateData.interrogation,
      lessonsRead: stateData.lessonsRead,
      schemaBuilderDdl: stateData.schemaBuilderDdl,
      completedAt: stateData.completedAt,
      // Espelho do caso ativo: bossFight do caso atual para leitura via progressByCase.
      bossFight: (stateData.bossByCase && typeof stateData.bossByCase === 'object')
        ? { [normalized.currentCase]: stateData.bossByCase[normalized.currentCase] || {} }
        : {},
    });
  }
  // Fonte de verdade das batalhas de boss: nível superior do LS, incluindo casos vazios
  // quando o estado ativo possui o espelho (evita perda ao regravar).
  const hasBossMirror = stateData.bossByCase && typeof stateData.bossByCase === 'object' && !Array.isArray(stateData.bossByCase);
  const bossByCase = hasBossMirror ? stateData.bossByCase : (normalized.bossByCase || {});
  return { currentCase: normalized.currentCase, progressByCase: normalized.progressByCase, bossByCase };
}

export function saveState(stateData) {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(stateData)));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    return false;
  }
}

export function loadState() {
  if (!isLocalStorageAvailable()) return getDefaultState();
  const rawV2 = localStorage.getItem(STORAGE_KEY);
  const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
  const v2 = parseStoredState(rawV2);
  const legacy = parseStoredState(rawV1, true);
  let result = v2 || legacy || getDefaultState();

  // Uma chave v2 criada sem progresso nao deve apagar o save antigo do Caso #001.
  if (v2 && legacy && !hasProgress(v2.progressByCase.case001) && hasProgress(legacy.progressByCase.case001)) {
    result = normalizeState({
      currentCase: v2.currentCase,
      progressByCase: { ...v2.progressByCase, case001: legacy.progressByCase.case001 },
    });
  }

  // A chave v2 e canônica; depois de ler com segurança, descartamos v1 residual.
  if (rawV1 !== null || (!v2 && legacy)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentCase: result.currentCase, progressByCase: result.progressByCase, bossByCase: result.bossByCase || {} }));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.warn('Nao foi possivel concluir a migracao do progresso:', error);
    }
  }
  return result;
}

export function clearState() {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar progresso:', error);
    return false;
  }
}

export function hasSavedState() {
  if (!isLocalStorageAvailable()) return false;
  try { return localStorage.getItem(STORAGE_KEY) !== null || localStorage.getItem(LEGACY_STORAGE_KEY) !== null; }
  catch { return false; }
}
