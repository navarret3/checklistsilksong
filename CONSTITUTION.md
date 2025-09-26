# 🏛 Constitución del Proyecto – Silksong 100% Checklist

Proyecto: **Silksong 100% Checklist**  
Dominio: Progreso completionista del videojuego (placeholder usando items de Hollow Knight)  
Fecha inicial: 2025-09-25  
Versión: 0.1

## 1. Visión
Ofrecer una web ultra ligera para que jugadores marquen su avance hacia el 100%: cada item aporta una unidad de progreso, persistido localmente, con UX instantánea y soporte ES/EN.

## 2. Principios Fundamentales
| Tema | Principio | Criterio Medible |
|------|-----------|------------------|
| Simplicidad | Evitar frameworks pesados en MVP | Bundle JS `< 100KB` gzip |
| Rendimiento | Carga inmediata en navegadores modernos | FCP `< 1s` (desktop), interacción `< 50ms` |
| Accesibilidad | Navegable por teclado y contraste correcto | Navegación tab completa + WCAG AA en texto principal |
| i18n | Todos los textos externalizados | 0 strings literales en HTML/JS (excepción datos) |
| Integridad de Progreso | Persistencia local robusta | 100% items restaurados tras recarga |
| Datos Estáticos | Dataset versionado y aislado | Campo `dataVersion` incrementado en cambios |
| Evolutividad | Poder cambiar dataset sin reescribir lógica | Lógica separada de datos en `data/` |
| UX Clara | Estado y porcentaje visibles siempre | Barra / indicador fijo visible en viewport |
| Mantenibilidad | Código modular y plano | Módulos <= 300 líneas, lint sin errores |
| Internacionalización | Fallback en EN si falta clave | Test de carga de catálogos pasa |

## 3. Alcance MVP
- Render estático de todos los items (placeholder Hollow Knight) normalizados a peso uniforme.
- Toggle de estado (unchecked/checked) por item.
- Re-cálculo y visualización de porcentaje global entero.
- Persistencia local (LocalStorage) y opción de limpiar con confirmación doble.
- Soporte de idioma ES/EN (selector simple, fallback EN).
- Responsive básico (mobile-first, grid flexible).

## 4. Fuera de Alcance (MVP)
- Backend / cuentas / sincronización nube.
- Export/import JSON (backlog).
- PWA offline (backlog).
- Filtros avanzados / búsqueda.
- Spoiler toggle (pendiente de datos reales -> backlog).

## 5. Métricas de Calidad
| Área | Métrica | Objetivo |
|------|---------|----------|
| Rendimiento | FCP desktop | < 1s |
| Rendimiento | Interacción toggle | < 50ms |
| Código | Errores ESLint | 0 |
| Datos | IDs duplicados | 0 |
| Progreso | Restauración tras reload | 100% |
| i18n | Claves faltantes runtime | 0 |

## 6. Arquitectura (Guía)
- Sitio estático (HTML + CSS + JS modular).
- Carpetas previstas: `src/js`, `src/data`, `src/i18n`, `dist/`.
- Build opcional (esbuild / Vite) solo si se supera límite de tamaño manual.
- `gameData.json` transformado a lista plana consumible.

## 7. Seguridad
- No inputs de usuario arbitrarios (solo toggles). Riesgo XSS bajo.
- Sanitizar/strip de HTML en nombres si se importan de fuente externa.
- Sin cookies ni tracking PII.

## 8. Observabilidad (mínimo)
- Logs en consola para errores de carga de datos o corrupción de LocalStorage.
- Hook simple `warnIfDataMismatch(totalExpected, totalLoaded)`.

## 9. Performance
- Carga diferida de i18n (solo idioma seleccionado, fallback en memoria).
- Uso de event delegation para toggles.
- Minimizar relayout (usar clases CSS para estados).

## 10. Accesibilidad e i18n
- Cada item con `role="checkbox"` + `aria-checked`.
- Focus visible.
- Textos en `i18n/<locale>.json`; fallback EN si falta clave.

## 11. Definition of Done (Feature)
1. Lista renderiza todos los items.
2. Toggling actualiza UI y persistencia.
3. Porcentaje recalculado exacto.
4. Idioma intercambiable sin recargar (o con recarga controlada) mostrando traducciones.
5. Lint sin errores.
6. Prueba unitaria `computePercent` pasa.
7. FCP medido < objetivo local.
8. Documentación README actualizada.

## 12. Definition of Done (Release)
1. Todas las features MVP DONE.
2. dataVersion documentado.
3. CHANGELOG con entrada.
4. Licencia MIT presente.
5. Sin TODO críticos abiertos.
6. Verificación manual en móvil y desktop.

## 13. Gestión de Cambios
- Cambios de dataset -> `dataVersion++` + nota en CHANGELOG.
- Decisiones -> ADR en `docs/adrs/`.

## 14. Versionado
- SemVer para el sitio (v0.x hasta datos oficiales).
- `dataVersion` para dataset.

## 15. Riesgos Iniciales
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Dataset no definitivo | Re-trabajo | Script de transformación aislado |
| Crecimiento de datos | Performance UI | Agrupar / paginar futuro |
| Traducciones incompletas | UX inconsistente | Fallback EN + checklist claves |

## 16. Revisión
- Revisar constitución cada 4 semanas o al cambiar dataset >10%. 

---
Guía base para /specify, /plan y /tasks. Cualquier excepción: ADR.
