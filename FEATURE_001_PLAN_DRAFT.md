# 🗺 Plan Técnico (Draft) - Feature 001
Estado: Draft (se refina después de /clarify)

## 1. Stack Propuesto
- Lenguaje: Python 3.11+
- Persistencia: Fase 1 -> archivo JSON estructurado; opción alterna: SQLite (modularizar para swap futuro)
- CLI inicial (posible script) para crear/ejecutar checklists
- Tests: pytest
- Formato IDs: UUIDv4

## 2. Capas / Módulos
| Módulo | Rol | Artefactos |
|--------|-----|-----------|
| domain | Entidades, value objects, invariantes | `domain/models.py`, `domain/errors.py` |
| application | Casos de uso y orquestación | `application/use_cases/*.py` |
| infrastructure | Repos (archivo / sqlite), serialización | `infrastructure/repos/*.py` |
| interface | CLI / (futuro API) | `interface/cli.py` |
| tests | Pruebas | `tests/domain`, `tests/application` |

## 3. Entidades (Domain)
Checklist(id, title, description, createdAt)
ChecklistVersion(id, checklistId, versionNumber, items[], createdAt)
ChecklistItem(id, order, text)
Run(id, checklistVersionId, startedAt, finishedAt?, stats)
RunItemState(id, runId, checklistItemId, status, updatedAt)

Statuses: PENDING, IN_PROGRESS, DONE, BLOCKED (Enum)

## 4. Repositorios (Interfaces)
ChecklistRepository:
- create_checklist(title, description, items[])
- get_checklist(id)
- list_checklists()
- create_new_version(checklistId, items[])
- get_version(versionId)
- list_versions(checklistId)

RunRepository:
- create_run(checklistVersionId)
- get_run(id)
- update_item_state(runId, itemId, newState)
- finish_run(runId)
- export_run(runId) -> JSON structure

## 5. Casos de Uso (Application)
CreateChecklistUseCase
VersionChecklistUseCase
StartRunUseCase
UpdateRunItemStateUseCase
FinishRunUseCase
ExportRunUseCase

## 6. Persistencia Inicial (Archivo JSON)
Estructura de directorio `.data/`:
- checklists.json
- versions/<checklistId>/<versionNumber>.json
- runs/<runId>.json

Operaciones atómicas: escribir a `<file>.tmp` y luego `rename`.

## 7. Validaciones / Invariantes
- Crear checklist: >=1 ítem
- Versionar: detectar cambios estructurales; si no hay cambios -> error
- Actualizar estado: sólo transiciones válidas (definir si todas permitidas o restringidas)

## 8. Errores / Excepciones
- ChecklistNotFound
- VersionNotFound
- RunNotFound
- InvalidStateTransition
- NoStructuralChanges
- ValidationError

## 9. Logging
Wrapper simple con `logging` (nivel configurable), salida JSON (dict -> json.dumps).

## 10. Métricas (Futuro)
Hook para medir latencias (decorador) cuando se introduzca instrumentation.

## 11. Testing Strategy
- Domain: entidades + invariantes (unit)
- Application: casos de uso con repos fake
- Infra: tests de integración con filesystem temporal

## 12. Riesgos Técnicos y Mitigación
| Riesgo | Mitigación |
|--------|-----------|
| Condiciones carrera en FS | Bloqueo simple (file lock) si surge necesidad |
| Crecimiento de archivos | Migrar a SQLite cuando > N runs |

## 13. Futuras Extensiones
- API REST
- Autenticación básica
- Etiquetas/categorías en ítems

## 14. Pendiente de Clarificación
Secciones 3, 6, 7 dependen de respuestas a preguntas en `FEATURE_001_SPECIFY.md`.

---
Listo para refinamiento tras `/clarify` y luego generación de `/tasks`.
