# 🗺 Plan Técnico – Silksong 100% Checklist
Estado: Draft
Fecha: 2025-09-25

## 1. Arquitectura General
Sitio estático servido desde hosting estático (GitHub Pages / Netlify). HTML base + JS modular. Sin framework grande (vanilla + utilidades pequeñas). Dataset transformado a lista plana.

## 2. Estructura de Carpetas
```
root/
  src/
    data/ (fuente transformada) 
    js/
      main.js
      dataLoader.js
      progress.js
      i18n.js
      ui.js
      storage.js
    i18n/
      en.json
      es.json
  scripts/
    transform_hk_data.js
  dist/ (build opcional)
  index.html
```

## 3. Esquema Dataset (silksong_placeholder_items.json)
```json
{
  "dataVersion": 1,
  "items": [
    {"id": "broken-vessel", "name": {"en": "Broken Vessel", "es": "Broken Vessel"}, "category": "Bosses", "wikiUrl": "https://..."},
    {"id": "mothwing-cloak", "name": {"en": "Mothwing Cloak", "es": "Mothwing Cloak"}, "category": "Equipment", "wikiUrl": "https://..."}
  ]
}
```

## 4. Módulos JS
| Módulo | Responsabilidad | API |
|--------|-----------------|-----|
| dataLoader | Cargar y validar dataset | `loadData()` -> {dataVersion, items} |
| storage | Persistencia local | `loadProgress()`, `saveProgress(state)`, `clearProgress()` |
| progress | Lógica de conteo | `computePercent(items, progress)`, `toggle(id, progress)` |
| i18n | Carga catálogos y traducción | `setLocale(lc)`, `t(key)`, `availableLocales()` |
| ui | Render y eventos | `renderList(items, progress)`, `bindEvents()` |
| main | Orquestación | `init()` |

## 5. Flujo de Inicio
1. `loadData()` -> valida unicidad de IDs.
2. `loadProgress()` -> genera objeto `{[id]: true|false}` por defecto `false`.
3. Render lista + porcentaje.
4. Bind listeners (delegation) para toggles.
5. Selector idioma -> llama `setLocale` y re-render textos.

## 6. Validaciones
- IDs únicos -> lanzar error y detener si duplicados.
- Lista no vacía.
- Progress keys siempre subset de items.
- En toggle: si id inexistente -> ignorar (log warn).

## 7. Persistencia
LocalStorage key: `silksongChecklistProgress_v1`.
Formato: `{ "version": dataVersion, "items": {"broken-vessel": true, ...} }`.
Si `version` difiere de dataset actual -> migración simple (reset ó map conservador si IDs iguales).

## 8. Cálculo de Porcentaje
```
completed = count(progress[id] == true)
total = items.length
percent = Math.floor((completed/total)*100)
```
Return: `{completed, total, percent}`.

## 9. i18n
- Archivos `en.json`, `es.json` con claves: `title`, `reset.confirm1`, `reset.confirm2`, `percent.label`, etc.
- `t(key)` -> fallback EN si falta clave en locale activo.

## 10. UI / Accesibilidad
- Cada fila item: `<div role="checkbox" aria-checked="false" tabindex="0" data-id="...">`.
- Toggle con Enter/Espacio (key handler global).
- Porcentaje visible en encabezado sticky.

## 11. Reset Progreso
Secuencia:
1. Usuario click "Reset".
2. Modal 1: confirma.
3. Modal 2: requiere segundo click "Confirmar".
4. Ejecutar `clearProgress()` y re-render.

## 12. Errores / Logging
| Evento | Acción |
|--------|-------|
| Duplicated IDs | `console.error` y detener init |
| Load progress corrupto | `console.warn` y reset |
| Falta catálogo i18n | `console.warn` fallback EN |

## 13. Testing (mínimo)
- `progress.computePercent` con casos: 0%, parcial, 100%.
- (Opcional) test de migración de version.

## 14. Build / Deployment
MVP sin bundler: un `<script type="module">`. Añadir bundler (esbuild script) si número de módulos > 6 o tamaño > 100KB.

## 15. Riesgos Técnicos y Mitigación
| Riesgo | Mitigación |
|--------|-----------|
| Crece dataset y ralentiza render | Render fragment + requestAnimationFrame chunk si > 2k items |
| LocalStorage borrado por usuario | Botón export futuro (backlog) |
| Traducciones faltantes | Script verificación claves |

## 16. Evolución Futura
- Export/Import JSON.
- PWA manifest + service worker.
- Filtros por categoría / buscador.
- Spoiler gating (prop `spoiler: true`).

## 17. Métricas Manuales Iniciales
- Consola: log tiempo de init (performance.now()).

---
Listo para derivar /tasks.
