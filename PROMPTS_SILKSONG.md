# Prompts Optimized – Silksong 100% Checklist

Este documento recopila el "Contexto Maestro" y los prompts listos para usar con Spec Kit (/constitution, /specify, /clarify, /plan, /tasks) y un brief macro para Jules. Incluye también recomendaciones para completar los huecos que no definiste aún.

---
## 1. Contexto Maestro (Rellenado + Sugerencias)
Producto / Dominio: Sitio web público `silksongchecklist.com` para que jugadores sigan el progreso hacia el 100% de Hollow Knight: Silksong (paralelo al repositorio de ejemplo de Hollow Knight checklist).

Visión: Proveer una checklist interactiva, ligera y rápida, con persistencia local del progreso y cálculo simple del porcentaje completado (cada ítem = 1%).

Problema: Los jugadores que quieren hacer el 100% pierden seguimiento de qué falta; necesitan una vista consolidada y persistente de avance.

Personas (propuestas):
- Complecionista Casual: Quiere saber cuánto le falta sin abrir múltiples wikis. Frustración: perder tiempo saltando entre páginas.
- Speedrunner Explorador: Quiere validar rutas optimizadas. Frustración: rehacer conteos manuales.
- Lector de Wiki: Quiere enlaces directos para detalles. Frustración: copiar/pegar búsquedas.

Diferenciadores (dados + añadidos sugeridos):
- Fiel al estilo del checklist Hollow Knight existente (estructura y UX minimalista).
- Carga muy rápida (sin frameworks pesados; potencialmente HTML/CSS/JS vanilla + build ligero opcional).
- Datos separados de la lógica (facilita actualización cuando salga Silksong oficial).
- Persistencia local (LocalStorage) sin registro.

Objetos de Dominio (propuestos; antes dijiste "No tiene" – aquí una propuesta mínima):
- GameItem: Objeto coleccionable o logro que aporta 1% al progreso.
- ItemCategory: Agrupa items (ej: Armas, Herramientas, Regiones, NPCs, Secretos). (Opcional si se quiere la misma estructura que el repo base.)
- ProgressState: Estructura de persistencia (map itemId -> completed:boolean).
- GameData: Colección estática de items (JSON). 
- Settings (opcional futuro): Preferencias (idioma, tema oscuro).

NOTA: MVP usará temporalmente el mismo set de items del proyecto Hollow Knight original como placeholder hasta tener datos confirmados de Silksong. Se normalizarán a peso uniforme (1 punto) ignorando fracciones (ej. vessel_fragments, mask_shards) para simplificar. Cuando existan datos oficiales de Silksong se hará migración: `dataVersion++` y re-cálculo.

Estados y Transiciones (propuesta):
- Item: UNCHECKED -> CHECKED (toggle simple). (No estados intermedios MVP.)

Reglas de Negocio (RN) – propuesta inicial:
- RN-1: Cada item válido aporta exactamente 1 punto de progreso.
- RN-2: El porcentaje mostrado = (itemsCompletados / totalItems) * 100 redondeado a entero.
- RN-3: Los IDs de items son únicos e inmutables una vez publicados.
- RN-4: Si se agrega un nuevo item (después de lanzamiento), el % recalcula automáticamente.
- RN-5: La persistencia es local; limpiar datos debe requerir confirmación doble.

Métricas de Éxito (propuesta):
- Técnica: Tiempo de carga inicial (First Contentful Paint) < 1s en desktop moderno; bundle JS < 100KB gzip (MVP). 
- Producto: Retención (usuario vuelve y encuentra progreso intacto) ≥ 80% de sesiones repetidas en 7 días (medible más adelante si se añade analítica). 

Alcance MVP (propuesto):
- Render estático de lista de items.
- Cálculo dinámico de % completado.
- Persistencia local en LocalStorage.
- Soporte bilingüe ES / EN (estructura de i18n básica con claves). 
- Responsive simple (mobile-first).

Fuera de Alcance MVP:
- Backend / cuentas / login.
- Sincronización nube.
- Progreso multi-dispositivo.
- Analítica avanzada.
- Modo offline PWA (puede estar en backlog).

Requisitos No Funcionales (propuestos):
- Rendimiento: FCP < 1s; interacción lista < 50ms por click.
- Accesibilidad: Navegación por teclado; contraste AA; roles ARIA en contenedores de lista.
- i18n: Strings en archivo JSON `i18n/es.json` y `i18n/en.json`.
- Seguridad: Evitar inyección (datos estáticos); no cookies.
- Simplicidad: Sin framework grande (React/Vue) en MVP; considerar build con esbuild / Vite sólo si ayuda a modularidad.

Persistencia Inicial: LocalStorage (`silksongChecklistProgress_v1`). Evolución: posiblidad de export/import JSON.

Versionado (propuesta):
- App SemVer (ej: v0.1.0 MVP).
- Schema de datos (gameData.json) versionado con campo `dataVersion`.

Extensibilidad: Añadir flags a items (ej: missable, late-game) sin romper UI principal.

Riesgos (propuestos):
- R1: Cambio en lista oficial de contenido -> Recalcular totales; Mitigación: script de validación de IDs.
- R2: Sobrecarga futura si se añade backend -> Mantener dominio desacoplado.

Calidad / DoD (propuesto rápido):
- Lint (ESLint) sin errores.
- Build reproducible.
- 1 test mínimo para cálculo de porcentaje.
- Código i18n aplica claves, no strings literales en UI.
- README actualizado.

Idiomas: ES y EN.
Licencia: Open source (MIT recomendada).
Escala esperada: ~10 usuarios/día en inicio (sin preocupaciones de carga).
Observabilidad: Minimal (puede agregarse logging en consola para debug). 
Roadmap (propuesto): PWA offline, export/import JSON, filtros por categoría, marcadores condicionales (spoilers ocultables).
Estilo Documentación: Conciso, espejo del checklist Hollow Knight (tono directo y mínimo adorno).

---
## 2. Prompt /constitution

/constitution
Crea la constitución del proyecto Silksong 100% Checklist.
Contexto breve: Web estática ligera para trackear progreso 100% de Silksong, cada item = 1%. Inspirada en hollow-knight-checklist. Sin backend, sólo LocalStorage. i18n ES/EN.
Necesito:
- Principios organizados (Simplicidad, Rendimiento, Accesibilidad, i18n, Datos Estáticos, Evolutividad, UX Clara, Integridad de Progreso, Mantenibilidad, Internacionalización).
- Tabla: Principio | Enunciado | Criterio medible.
- Métricas: FCP <1s, JS bundle <100KB gzip, % items consistentes (IDs únicos 100%).
- Definition of Done para feature (mín 8 puntos) + para release.
- Gestión de datos: versionado gameData.json con `dataVersion`.
- Riesgos y mitigaciones (R1 cambio lista, R2 crecimiento features, R3 traducciones incompletas).
- Revisión periódica (cada 4 semanas o antes de incorporar nuevas categorías masivas).
Formato: markdown compacto. No inventes backend.

---
## 3. Prompt /specify

/specify
Especifica el MVP para Silksong 100% Checklist.
Incluir:
1. Contexto (máx 4 frases).
2. Personas (3 roles) con objetivo y frustración.
3. Historias de usuario numeradas (crear/ver lista, marcar item, ver % global, cambiar idioma, limpiar progreso con confirmación doble, ver enlaces externos opcionales si existen datos).
4. Reglas de negocio RN-1..RN-5 (descritas en contexto maestro; complementa si detectas huecos).
5. Modelo conceptual (GameItem, ItemCategory, ProgressState, GameData, i18nCatalog).
6. Criterios de aceptación por historia (tabla).
7. Métricas de éxito MVP (técnica + producto como sugeridas).
8. Preguntas de clarificación (si aún dudas: orden de categorías, si hay spoilers, política de items ocultables, formato export futuro).
No incluir detalles de implementación (no frameworks).

---
## 4. Prompt /clarify

/clarify
Responde o marca como PENDIENTE:
1. ¿Estructura exacta de gameData.json? (Proponer: id, name, category, order, wikiUrl?).
2. ¿Orden de categorías fijo? (Proponer lista inicial vacía si no se define).
3. ¿Soporte de "spoilers" (ocultar ciertos items hasta toggle)?
4. ¿Formato numérico del porcentaje (entero / 1 decimal)? (Proponer entero redondeado.)
5. ¿Confirmación de borrado: doble modal vs escribir palabra? (Proponer doble modal.)
6. ¿Estrategia de i18n: fallbacks en inglés si falta clave? (Proponer sí.)
7. ¿Necesitamos un campo 'deprecated' para items futuros removidos? (Proponer sí para mantener consistencia.)
Deja listado final de decisiones + marcadas PENDIENTE las no aceptadas.

---
## 5. Prompt /plan

/plan
Genera plan técnico basado en constitución + especificación + clarificaciones de Silksong 100% Checklist.
Contenido requerido:
1. Arquitectura (archivos estáticos + JS modular; sin framework grande; posible builder opcional).
2. Estructura de carpetas propuesta (src/data, src/js, src/i18n, dist/...).
3. Esquema gameData.json con ejemplo de 2 items.
4. Módulo progreso: API mínima (loadProgress, toggleItem(id), computePercent, clearProgress(confirmToken)).
5. Módulo i18n: carga de catálogos, fallback.
6. Validaciones (IDs únicos, total >0, item no se marca dos veces sin toggle, confirmaciones).
7. Estrategia build (opcional: esbuild/Vite) – si se usa, explicar ventajas; si no, justificar simplicidad.
8. Testing mínimo (1 test pure JS para computePercent). Si test no se hace ahora, anotar deuda.
9. Gestión de versión de datos (dataVersion bump + recalcular). 
10. Riesgos técnicos y mitigación (R1 data drift, R2 escalado categorías, R3 mantener traducciones).
No generar código final todavía, sólo especificaciones precisas.

---
## 6. Prompt /tasks

/tasks
Transforma el plan aprobado en tareas.
Formato por tarea:
- ID: T-XX
- Categoría: (Data, Core, UI, i18n, Infra, QA, Docs)
- Descripción accionable
- Dependencias (IDs)
- Done Criteria (claro y verificable)
Agrupa en secciones y marca las bloqueantes del primer incremento: cargar datos, render listado, toggle item, porcentaje.

---
## 7. Prompt Macro para Jules

(Si Jules requiere un brief amplio.)

Proyecto: Silksong 100% Checklist Web
Objetivo: Sitio ultra simple para marcar progreso de completion del juego. Cada item = 1%. Inspirado en hollow-knight-checklist.
Necesito: Refinar data model, confirmar UX minimalista, producir lista clara de items para MVP y detectar huecos (spoilers, categorías, export futuro).
Incluye: Personas (3), Historias, Reglas de negocio (RN-1..RN-5), Modelo conceptual (GameItem, ItemCategory, ProgressState, GameData, i18nCatalog), Métricas (FCP <1s, bundle <100KB), Riesgos (data updates, traducciones), Roadmap (PWA offline, export/import, filtros, spoiler toggle).
Entrega deseada: Documento estructurado con secciones, tablas para historias y criterios, listado de preguntas abiertas si algo queda ambiguo.
No incluir frameworks ni backend. Mantener tono conciso.

---
## 8. Siguientes Pasos Recomendados
1. Confirma / edita cualquiera de las propuestas (especialmente categorías e items). 
2. Usa `/constitution` con el prompt arriba.
3. Luego `/specify`.
4. Ejecuta `/clarify` y responde/ajusta.
5. `/plan` y `/tasks`.
6. Recién ahí empezar implementación manual (o usar /implement si procede en tu flujo con Spec Kit).

---
## 9. Lista de Posibles Categorías Sugeridas (Placeholder – EDITA)
- Tools
- Abilities
- Regions
- NPC Quests
- Bosses Required
- Collectibles
(Elimina o renombra según info oficial de Silksong una vez disponible.)

---
## 10. Ejemplo gameData.json (mini)
```json
{
  "dataVersion": 1,
  "items": [
    { "id": "ability_dash", "name": {"en": "Dash", "es": "Deslizar"}, "category": "Abilities", "order": 1, "wikiUrl": "https://example.com/dash" },
    { "id": "tool_grapple", "name": {"en": "Grapple Tool", "es": "Garfio"}, "category": "Tools", "order": 2, "wikiUrl": "https://example.com/grapple" }
  ]
}
```

---
## 11. Nota sobre Slash Commands
El error `Exit Code:127` que viste al intentar `/constitution` en terminal ocurre porque los slash commands son para el agente de IA (chat), no para la shell. Debes pegar el prompt en la ventana de chat de tu agente (Copilot, etc.).

---
## 12. Qué Revisar Antes de Ejecutar Prompts
- Definir al menos 5–10 items reales o placeholders.
- Decidir si se manejarán spoilers.
- Confirmar idioma default (ES o EN) para fallback.

---
Cuando confirmes ajustes, puedo generar directamente los archivos finales `CONSTITUTION.md`, `SPECIFICATION.md`, `PLAN.md`, `TASKS.md` ya rellenados.
