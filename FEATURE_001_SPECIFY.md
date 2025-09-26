# 🧾 Feature 001: Gestión básica de Checklists
Estado: Draft  
Fecha: 2025-09-25  
Versión documento: 0.1

## 1. Contexto / Problema
Los equipos necesitan crear y ejecutar listas de verificación reutilizables para procesos repetitivos (deploys, QA smoke tests, auditorías internas). Actualmente usan documentos dispersos sin versionado ni trazabilidad de ejecuciones.

## 2. Objetivo
Implementar la base que permita:
- Crear un checklist con título, descripción y ítems
- Versionar una checklist al aplicar cambios estructurales
- Ejecutar (run) un checklist y registrar el estado de cada ítem
- Exportar el resultado de un run en JSON

## 3. Stakeholders / Usuarios
| Rol | Necesidad |
|-----|-----------|
| Ingeniero DevOps | Ver el estado actual de un proceso de despliegue |
| QA Lead | Auditar ejecución de pasos críticos |
| Auditor interno | Evidencia de cumplimiento de controles |

## 4. Historias de Usuario
1. Como usuario quiero crear un checklist con varios ítems para reutilizarlo en procesos.
2. Como usuario quiero versionar el checklist cuando modifico los ítems para mantener historial.
3. Como usuario quiero iniciar una ejecución (run) de un checklist para registrar el avance.
4. Como usuario quiero marcar ítems como pendiente/en progreso/hecho/bloqueado para reflejar el estado real.
5. Como usuario quiero exportar el resultado de una ejecución para archivarlo o compartirlo.

## 5. Reglas de Negocio
| Regla | Descripción |
|-------|-------------|
| RN-1 | Un checklist tiene al menos 1 ítem |
| RN-2 | Cambios en orden, texto o cantidad de ítems generan nueva versión |
| RN-3 | Un run siempre referencia una versión inmutable |
| RN-4 | Estados válidos item-run: PENDING, IN_PROGRESS, DONE, BLOCKED |
| RN-5 | No se puede eliminar una versión que ya tiene runs |

## 6. Definiciones / Glosario
| Término | Definición |
|---------|-----------|
| Checklist | Plantilla versionable de ítems |
| ChecklistVersion | Snapshot inmutable de la estructura |
| Run | Instancia de ejecución de una versión |
| RunItemState | Estado de un ítem dentro de un run |

## 7. Suposiciones
- Un primer almacenamiento local es suficiente (sin multiusuario concurrente intenso)
- No se requiere autenticación inicial

## 8. Fuera de Alcance (para esta feature)
- UI web avanzada
- Control de permisos de escritura / lectura
- Integraciones externas

## 9. Criterios de Aceptación (alto nivel)
| Historia | Criterio |
|----------|----------|
| 1 | Crear checklist retorna identificador y versión inicial = 1 |
| 2 | Modificar ítems produce versión n+1 y preserva n anterior |
| 3 | Iniciar run crea estados iniciales PENDING para cada ítem |
| 4 | Actualizar estado válido persiste cambio con timestamp |
| 5 | Export produce JSON con metadatos (version, timestamps, counts) |

## 10. Datos / Modelo Inicial (borrador)
Checklist: id, title, description, createdAt
ChecklistVersion: id, checklistId, versionNumber, items[ {id, order, text}], createdAt
Run: id, checklistVersionId, startedAt, finishedAt?, stats{pending,inProgress,done,blocked}
RunItemState: id, runId, checklistItemId (versión), status, updatedAt, notes?

## 11. Métricas de Éxito
- Crear checklist < 200ms local
- Marcar ítem < 150ms P95
- Export JSON válido 100% runs

## 12. Riesgos / Mitigación
| Riesgo | Mitigación |
|--------|-----------|
| Explosión de versiones triviales | Detectar cambios estructurales reales (texto/orden/número) |
| Corrupción de datos en archivo | Añadir escritura atómica (tmp + rename) |

## 13. Preguntas de Clarificación (para /clarify)
1. ¿Formato preferido de export (JSON plano vs anidado)?
2. ¿Necesitamos notas/comentarios por ítem en un run inicial? (scope creep)
3. ¿Límites de longitud para títulos y descripciones?
4. ¿Necesitamos timestamps por cada transición de estado o sólo último cambio?
5. ¿Se permite retroceder un estado (DONE -> IN_PROGRESS)?

## 14. Tareas de Descubrimiento (previas a /plan)
- Validar librería o enfoque para persistencia (sqlite3 stdlib vs archivo JSON)
- Definir estructura de repositorios / puertos
- Definir convención de IDs (UUID estándar)

## 15. Definition of Done (Feature)
- Todas las historias y criterios satisfechos
- Tests de dominio + casos borde (0 ítems rechazado, versión inmutable, estados inválidos)
- Script de test/documentación actualizada
- Sin CVEs críticos

---
Listo para pasar a `/clarify` y luego `/plan`.
