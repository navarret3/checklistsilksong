# 📘 Especificación MVP – Silksong 100% Checklist
Estado: Draft
Fecha: 2025-09-25

## 1. Contexto
Web estática ligera para que jugadores marquen su avance hacia el 100%. Cada item vale 1 punto (normalización temporal de datos Hollow Knight). Persistencia local. Soporte ES/EN. Sin backend.

## 2. Personas
| Rol | Objetivo | Frustración Actual |
|-----|----------|--------------------|
| Complecionista Casual | Ver de un vistazo cuánto falta | Perder tiempo revisando wikis dispersas |
| Speedrunner Explorador | Validar rutas de obtención optimizadas | Rehacer conteos manuales |
| Lector de Wiki | Acceder a la wiki desde cada item | Abrir pestañas y buscar manualmente |

## 3. Historias de Usuario
| ID | Historia |
|----|---------|
| H1 | Como usuario quiero ver la lista completa de items para entender el alcance del 100% |
| H2 | Como usuario quiero marcar/desmarcar un item para reflejar mi progreso real |
| H3 | Como usuario quiero ver el porcentaje global actualizado para saber cuánto me falta |
| H4 | Como usuario quiero cambiar el idioma ES/EN para usar mi preferencia |
| H5 | Como usuario quiero reiniciar todo mi progreso con confirmación doble para empezar de cero |
| H6 | Como usuario quiero que cada item opcional tenga enlace externo para ampliar información (si existe) |

## 4. Reglas de Negocio
| Código | Regla |
|--------|-------|
| RN-1 | Cada item aporta 1 punto (placeholder) |
| RN-2 | Porcentaje = floor( (itemsMarcados / totalItems) * 100 ) |
| RN-3 | IDs de items son únicos e inmutables durante una versión de datos |
| RN-4 | Añadir un item nuevo recalcula inmediatamente el porcentaje |
| RN-5 | Limpieza de progreso requiere doble confirmación (modal + repetir acción) |

## 5. Modelo Conceptual
- GameItem: { id, name[locale], category, wikiUrl? }
- ProgressState: { [itemId]: boolean }
- GameData: { dataVersion, items[] }
- I18nCatalog: { key: translation }

## 6. Criterios de Aceptación
| Historia | Criterio |
|----------|---------|
| H1 | Se cargan N items (N > 0) sin errores console; orden estable |
| H2 | Click/tap cambia estado visual + persistencia (reload mantiene) |
| H3 | Indicador porcentaje muestra entero correcto en <100ms tras toggle |
| H4 | Selector idioma recarga/rehidrata textos sin romper progreso |
| H5 | Reinicio sólo ocurre tras confirmar dos veces; porcentaje vuelve a 0 |
| H6 | En items con wikiUrl, abrir enlace en nueva pestaña |

## 7. Métricas de Éxito
| Tipo | Métrica | Objetivo |
|------|--------|----------|
| Técnica | FCP desktop | <1s |
| Técnica | Toggle latency | <50ms |
| Datos | IDs duplicados | 0 |
| Producto | Progreso restaurado tras reload | 100% |

## 8. Preguntas de Clarificación
1. ¿Se requiere orden de categorías específico? (Si no, alfabético) 
2. ¿Habrá items "spoiler" ocultables? 
3. ¿Formato de export futuro (si se agrega)? 
4. ¿Se mostrarán contadores por categoría? 
5. ¿Tema oscuro necesario en MVP?

## 9. Suposiciones
- Categorías derivadas del dataset original, normalizadas a títulos capitalizados.
- Fallback idioma: EN.
- Enlace externo opcional no bloquea render si falla.

## 10. Fuera de Alcance
- Autenticación.
- Export/import.
- PWA.
- Filtros avanzados.

## 11. Riesgos
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cambios masivos dataset | Re-trabajo UI | Script transformación aislado |
| Falta de datos oficiales Silksong | Repetir normalización | Estructura plana genérica |
| Traducciones incompletas | Textos mezclados | Fallback EN + validación catálogo |

## 12. Definition of Ready (Historias)
- ID única
- Criterios claros
- Sin dependencias externas no resueltas

---
Listo para /clarify.
