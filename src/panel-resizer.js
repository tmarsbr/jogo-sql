/**
 * panel-resizer.js - Redimensionamento acessivel dos paineis laterais.
 *
 * Mantem a preferencia fora do estado do jogo e nao depende das demais
 * funcionalidades da aplicacao. Todos os acessos ao DOM e ao storage sao
 * defensivos para que o modulo tambem possa ser carregado nos testes Node.
 */

const STORAGE_KEY = 'sql-detective-panel-widths';
const DRAGGING_CLASS = 'is-panel-resizing';
const KEYBOARD_STEP = 10;
const EDITOR_MIN_WIDTH = 400;
const GRID_FIXED_WIDTH = 56 + (8 * 2);

const PANELS = {
  briefing: {
    selector: '[data-panel-resizer="briefing"]',
    panelId: 'panel-briefing',
    controls: 'panel-briefing panel-editor',
    cssVariable: '--briefing-panel-width',
    min: 240,
    max: 520,
    defaultWidth: 320,
    dragDirection: 1,
  },
  sidebar: {
    selector: '[data-panel-resizer="sidebar"]',
    panelId: 'panel-sidebar',
    controls: 'panel-editor panel-sidebar',
    cssVariable: '--sidebar-panel-width',
    min: 280,
    max: 760,
    defaultWidth: 340,
    dragDirection: -1,
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizedWidth(value, config, fallback) {
  const numeric = typeof value === 'number'
    ? value
    : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.round(clamp(numeric, config.min, config.max));
}

function safeQuery(documentRef, selector) {
  if (!documentRef || typeof documentRef.querySelector !== 'function') return null;
  try {
    return documentRef.querySelector(selector);
  } catch (_) {
    return null;
  }
}

function safePanel(documentRef, id) {
  if (!documentRef) return null;
  try {
    if (typeof documentRef.getElementById === 'function') {
      return documentRef.getElementById(id);
    }
    return safeQuery(documentRef, `#${id}`);
  } catch (_) {
    return null;
  }
}

function readStoredWidths(storage) {
  if (!storage || typeof storage.getItem !== 'function') return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function measurePanel(panel, config) {
  if (!panel || typeof panel.getBoundingClientRect !== 'function') {
    return config.defaultWidth;
  }

  try {
    const measured = Number(panel.getBoundingClientRect().width);
    // Zero e medidas de layouts responsivos/ocultos nao devem substituir o
    // tamanho desktop padrao.
    if (Number.isFinite(measured) && measured >= config.min && measured <= config.max) {
      return Math.round(measured);
    }
  } catch (_) {
    // Usa o padrao abaixo.
  }
  return config.defaultWidth;
}

function setAttribute(element, name, value) {
  if (!element || typeof element.setAttribute !== 'function') return;
  try {
    element.setAttribute(name, String(value));
  } catch (_) {
    // Elementos falsos ou incompletos podem rejeitar atributos.
  }
}

/**
 * Ativa os divisores redimensionaveis dos paineis laterais e controles de recolhimento.
 *
 * @param {object} [options]
 * @param {Document} [options.documentRef]
 * @param {Window} [options.windowRef]
 * @param {Storage} [options.storage]
 * @returns {Function} funcao idempotente que remove os listeners instalados
 */
export function initPanelResizers(options = {}) {
  const safeOptions = options && typeof options === 'object' ? options : {};
  const defaultDocument = typeof document !== 'undefined' ? document : null;
  const defaultWindow = typeof window !== 'undefined' ? window : null;
  const documentRef = safeOptions.documentRef === undefined
    ? defaultDocument
    : safeOptions.documentRef;
  const windowRef = safeOptions.windowRef === undefined
    ? defaultWindow
    : safeOptions.windowRef;

  let storage = safeOptions.storage;
  if (storage === undefined && windowRef) {
    try {
      storage = windowRef.localStorage;
    } catch (_) {
      storage = null;
    }
  }

  const grid = safeQuery(documentRef, '.app-grid');
  if (!grid) return () => {};

  const body = documentRef && documentRef.body ? documentRef.body : null;
  const storedWidths = readStoredWidths(storage);
  const widths = {};
  const preferredWidths = {};
  const handles = {};
  const removers = [];
  let activeDrag = null;
  let cleanedUp = false;
  let briefingCollapsed = Boolean(storedWidths.briefingCollapsed);

  const btnRailToggle = safeQuery(documentRef, '#btn-rail-toggle-briefing');
  const btnCollapse = safeQuery(documentRef, '#btn-collapse-briefing');
  const btnToggle = safeQuery(documentRef, '#btn-toggle-briefing');

  function updateBriefingCollapsedUI(collapsed) {
    if (grid && grid.classList) {
      try {
        if (collapsed) {
          grid.classList.add('briefing-collapsed');
        } else {
          grid.classList.remove('briefing-collapsed');
        }
      } catch (_) {}
    }

    if (btnRailToggle) {
      setAttribute(btnRailToggle, 'aria-expanded', !collapsed);
      setAttribute(btnRailToggle, 'title', collapsed ? 'Expandir inquérito (Ctrl+B)' : 'Recolher inquérito (Ctrl+B)');
      setAttribute(btnRailToggle, 'aria-label', collapsed ? 'Expandir inquérito' : 'Recolher inquérito');
      if (btnRailToggle.classList) {
        try {
          if (collapsed) btnRailToggle.classList.add('collapsed');
          else btnRailToggle.classList.remove('collapsed');
        } catch (_) {}
      }
      const icon = safeQuery(btnRailToggle, '.rail-toggle-icon') || btnRailToggle;
      if (icon) {
        try {
          icon.textContent = collapsed ? '▶' : '◀';
        } catch (_) {}
      }
    }

    if (btnCollapse) {
      setAttribute(btnCollapse, 'aria-expanded', !collapsed);
      setAttribute(btnCollapse, 'title', 'Recolher inquérito (Ctrl+B)');
      setAttribute(btnCollapse, 'aria-label', 'Recolher inquérito');
    }

    if (btnToggle) {
      setAttribute(btnToggle, 'aria-expanded', !collapsed);
      if (btnToggle.classList) {
        try {
          if (collapsed) btnToggle.classList.add('active');
          else btnToggle.classList.remove('active');
        } catch (_) {}
      }
    }
  }

  function setBriefingCollapsed(collapsed) {
    briefingCollapsed = Boolean(collapsed);
    updateBriefingCollapsedUI(briefingCollapsed);
    persistWidths();
  }

  function toggleBriefing() {
    setBriefingCollapsed(!briefingCollapsed);
  }

  function setDraggingClass(enabled) {
    const classList = body && body.classList;
    if (!classList) return;
    try {
      if (enabled && typeof classList.add === 'function') classList.add(DRAGGING_CLASS);
      if (!enabled && typeof classList.remove === 'function') classList.remove(DRAGGING_CLASS);
    } catch (_) {
      // Um body parcial nao deve impedir o redimensionamento.
    }
  }

  function setHandleDragging(handle, enabled) {
    const classList = handle && handle.classList;
    if (!classList) return;
    try {
      if (enabled && typeof classList.add === 'function') classList.add('is-dragging');
      if (!enabled && typeof classList.remove === 'function') classList.remove('is-dragging');
    } catch (_) {
      // O estado visual e opcional em elementos parciais.
    }
  }

  function measureGridWidth() {
    const clientWidth = Number(grid.clientWidth);
    if (Number.isFinite(clientWidth) && clientWidth > 0) return clientWidth;
    if (typeof grid.getBoundingClientRect !== 'function') return 0;
    try {
      const measured = Number(grid.getBoundingClientRect().width);
      return Number.isFinite(measured) && measured > 0 ? measured : 0;
    } catch (_) {
      return 0;
    }
  }

  function getPanelBudget() {
    const available = Math.floor(measureGridWidth() - GRID_FIXED_WIDTH - EDITOR_MIN_WIDTH);
    const minimum = PANELS.briefing.min + PANELS.sidebar.min;
    return Number.isFinite(available) && available >= minimum ? available : null;
  }

  function fitWidthsToGrid(priorityName) {
    const fitted = {};
    for (const [name, config] of Object.entries(PANELS)) {
      fitted[name] = normalizedWidth(preferredWidths[name], config, config.defaultWidth);
    }

    const budget = getPanelBudget();
    if (budget === null) return fitted;

    let overflow = fitted.briefing + fitted.sidebar - budget;
    if (overflow <= 0) return fitted;

    if (priorityName && PANELS[priorityName]) {
      const otherName = priorityName === 'briefing' ? 'sidebar' : 'briefing';
      for (const name of [otherName, priorityName]) {
        const reduction = Math.min(overflow, fitted[name] - PANELS[name].min);
        fitted[name] -= reduction;
        overflow -= reduction;
        if (overflow <= 0) break;
      }
      return fitted;
    }

    while (overflow > 0) {
      const shrinkable = Object.keys(PANELS).filter(name => fitted[name] > PANELS[name].min);
      if (shrinkable.length === 0) break;
      const share = Math.ceil(overflow / shrinkable.length);
      for (const name of shrinkable) {
        const reduction = Math.min(share, overflow, fitted[name] - PANELS[name].min);
        fitted[name] -= reduction;
        overflow -= reduction;
      }
    }
    return fitted;
  }

  function applyPreferredWidths(priorityName) {
    const fitted = fitWidthsToGrid(priorityName);
    for (const [name, config] of Object.entries(PANELS)) {
      const width = fitted[name];
      widths[name] = width;

      if (grid.style) {
        try {
          if (typeof grid.style.setProperty === 'function') {
            grid.style.setProperty(config.cssVariable, `${width}px`);
          } else {
            grid.style[config.cssVariable] = `${width}px`;
          }
        } catch (_) {
          // Mantem ARIA e estado interno mesmo em um DOM incompleto.
        }
      }
      setAttribute(handles[name], 'aria-valuenow', width);
    }
  }

  function applyWidth(name, value) {
    const config = PANELS[name];
    if (!config) return;

    preferredWidths[name] = normalizedWidth(value, config, config.defaultWidth);
    applyPreferredWidths(name);
  }

  function commitAppliedWidths() {
    for (const name of Object.keys(PANELS)) preferredWidths[name] = widths[name];
  }

  function persistWidths() {
    if (!storage || typeof storage.setItem !== 'function') return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({
        briefing: preferredWidths.briefing,
        sidebar: preferredWidths.sidebar,
        briefingCollapsed: Boolean(briefingCollapsed),
      }));
    } catch (_) {
      // localStorage pode estar bloqueado ou sem espaco.
    }
  }

  function listen(target, type, listener) {
    if (!target || typeof target.addEventListener !== 'function') return;
    try {
      target.addEventListener(type, listener);
      removers.push(() => {
        if (typeof target.removeEventListener === 'function') {
          try {
            target.removeEventListener(type, listener);
          } catch (_) {
            // Cleanup deve continuar removendo os demais listeners.
          }
        }
      });
    } catch (_) {
      // Ignora apenas o listener que o alvo nao suporta.
    }
  }

  function pointerMatches(event) {
    if (!activeDrag) return false;
    return activeDrag.pointerId === undefined
      || event.pointerId === undefined
      || event.pointerId === activeDrag.pointerId;
  }

  function endDrag(event) {
    if (!activeDrag || !pointerMatches(event || {})) return;
    const drag = activeDrag;
    activeDrag = null;
    setDraggingClass(false);
    setHandleDragging(drag.handle, false);

    if (drag.handle && typeof drag.handle.releasePointerCapture === 'function'
      && drag.pointerId !== undefined) {
      try {
        drag.handle.releasePointerCapture(drag.pointerId);
      } catch (_) {
        // A captura pode ja ter sido perdida.
      }
    }
    commitAppliedWidths();
    persistWidths();
  }

  function onPointerMove(event) {
    if (!activeDrag || !pointerMatches(event || {})) return;
    const clientX = Number(event.clientX);
    if (!Number.isFinite(clientX)) return;

    const config = PANELS[activeDrag.name];
    const delta = (clientX - activeDrag.startX) * config.dragDirection;
    applyWidth(activeDrag.name, activeDrag.startWidth + delta);
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
  }

  for (const [name, config] of Object.entries(PANELS)) {
    const handle = safeQuery(documentRef, config.selector);
    const panel = safePanel(documentRef, config.panelId);
    handles[name] = handle;

    const measured = measurePanel(panel, config);
    const initial = normalizedWidth(storedWidths[name], config, measured);

    if (handle) {
      setAttribute(handle, 'role', 'separator');
      setAttribute(handle, 'tabindex', '0');
      setAttribute(handle, 'aria-orientation', 'vertical');
      setAttribute(handle, 'aria-controls', config.controls);
      setAttribute(handle, 'aria-valuemin', config.min);
      setAttribute(handle, 'aria-valuemax', config.max);

      listen(handle, 'pointerdown', event => {
        if (cleanedUp || (event && event.button !== undefined && event.button !== 0)) return;
        const clientX = Number(event && event.clientX);
        if (!Number.isFinite(clientX)) return;

        // Encerra uma eventual captura anterior antes de iniciar a nova.
        if (activeDrag) endDrag({ pointerId: activeDrag.pointerId });
        activeDrag = {
          name,
          handle,
          pointerId: event ? event.pointerId : undefined,
          startX: clientX,
          startWidth: widths[name],
        };
        setDraggingClass(true);
        setHandleDragging(handle, true);

        if (typeof handle.setPointerCapture === 'function'
          && activeDrag.pointerId !== undefined) {
          try {
            handle.setPointerCapture(activeDrag.pointerId);
          } catch (_) {
            // O drag ainda funciona pelos listeners do document/window.
          }
        }
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
      });

      listen(handle, 'keydown', event => {
        if (cleanedUp || !event) return;
        let nextWidth;
        if (event.key === 'Home') nextWidth = config.min;
        else if (event.key === 'End') nextWidth = config.max;
        else if (event.key === 'ArrowLeft') {
          nextWidth = widths[name] - (KEYBOARD_STEP * config.dragDirection);
        } else if (event.key === 'ArrowRight') {
          nextWidth = widths[name] + (KEYBOARD_STEP * config.dragDirection);
        } else {
          return;
        }

        applyWidth(name, nextWidth);
        commitAppliedWidths();
        persistWidths();
        if (typeof event.preventDefault === 'function') event.preventDefault();
      });

      listen(handle, 'dblclick', event => {
        if (cleanedUp) return;
        applyWidth(name, config.defaultWidth);
        commitAppliedWidths();
        persistWidths();
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
      });

      listen(handle, 'lostpointercapture', endDrag);
    }

    preferredWidths[name] = initial;
  }

  applyPreferredWidths();
  updateBriefingCollapsedUI(briefingCollapsed);

  // Botões de alternância
  if (btnRailToggle) {
    listen(btnRailToggle, 'click', () => toggleBriefing());
  }
  if (btnCollapse) {
    listen(btnCollapse, 'click', () => setBriefingCollapsed(true));
  }
  if (btnToggle) {
    listen(btnToggle, 'click', () => toggleBriefing());
  }

  // Document e a janela sao aceitos como alvos para manter o drag e atalhos funcionais.
  const moveTarget = documentRef && typeof documentRef.addEventListener === 'function'
    ? documentRef
    : windowRef;
  listen(moveTarget, 'pointermove', onPointerMove);
  listen(moveTarget, 'pointerup', endDrag);
  listen(moveTarget, 'pointercancel', endDrag);
  listen(windowRef, 'resize', () => applyPreferredWidths());

  listen(moveTarget, 'keydown', event => {
    if (cleanedUp || !event) return;
    if ((event.ctrlKey || event.metaKey) && (event.key === 'b' || event.key === 'B') && !event.altKey && !event.shiftKey) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      toggleBriefing();
    }
  });

  return function cleanupPanelResizers() {
    if (cleanedUp) return;
    cleanedUp = true;
    if (activeDrag) endDrag({ pointerId: activeDrag.pointerId });
    setDraggingClass(false);
    Object.values(handles).forEach(handle => setHandleDragging(handle, false));
    while (removers.length) removers.pop()();
  };
}
