# ✅ Tareas – Silksong 100% Checklist (MVP)
Estado: Draft
Fecha: 2025-09-25

Leyenda Categorías: Data, Core, UI, i18n, Infra, QA, Docs

## 1. Bloque Crítico (Primer Incremento)
| ID | Cat | Descripción | Dependencias | Done Criteria |
|----|-----|-------------|--------------|---------------|
| T-01 | Data | Incorporar JSON original completo (HK) y ejecutar script de transformación | - | Archivo `silksong_placeholder_items.json` generado |
| T-02 | Data | Normalizar categorías a formato título (Bosses, Equipment, ...) | T-01 | JSON transformado con `categoryTitle` |
| T-03 | Core | Implementar `dataLoader.loadData()` con validación IDs | T-02 | Rechaza dataset duplicado, retorna items |
| T-04 | Core | Implementar `storage` (load/save/clear) | T-03 | Guardado y restauración funcional tras reload |
| T-05 | Core | Implementar `progress.computePercent` y `toggle` | T-04 | Tests de 0%, parcial y 100% pasan |
| T-06 | UI | Crear `index.html` base con contenedores | T-03 | Render inicial sin errores console |
| T-07 | UI | Implementar `ui.renderList` + delegado de eventos click | T-05 | Toggling cambia clase y aria-checked |
| T-08 | UI | Mostrar porcentaje y actualizar tras toggle | T-05 | Valor correcto visible |
| T-09 | UI | Añadir soporte teclado (Enter/Espacio) para toggle | T-07 | Navegación y acción accesible |
| T-10 | i18n | Implementar `i18n.setLocale` + catálogos ES/EN | T-06 | Textos cambian, fallback EN funciona |
| T-11 | UI | Selector idioma en header | T-10 | Cambio refleja porcentaje etiqueta y strings |
| T-12 | Core | Limpieza de progreso (doble confirmación) | T-04 | Estado vuelve a 0 y localStorage reiniciado |
| T-13 | QA | Test unitario computePercent | T-05 | Test verde en ejecución local |
| T-14 | Docs | Actualizar README con uso e i18n | T-11 | README contiene instrucciones |
| T-15 | Infra | Script medición performance init | T-06 | Log en console tiempo <1s |

## 2. Mejora Posterior (Backlog)
| ID | Cat | Descripción | Done Criteria |
|----|-----|-------------|---------------|
| T-16 | Core | Script verificación claves i18n (diff) | Avisa faltantes |
| T-17 | UI | Tema oscuro (toggle) | Cambio persistente |
| T-18 | Core | Export/Import JSON progreso | Archivo descargable / import funcional |
| T-19 | UI | Filtros por categoría | Filtra sin recargar |
| T-20 | Core | Spoiler gating (flag) | Items ocultos hasta toggle global |
| T-21 | Infra | PWA manifest + sw básico | Instalación posible |
| T-22 | QA | Test migración `dataVersion` | Pasa con dataset v+1 |

## 3. Definición de Hecho (Checklist por tarea)
- Código commit sin errores ESLint.
- Nombres coherentes y sin strings literales i18n (salvo datos).
- Sin logs de error en consola en escenario principal.
- Test (si aplica) actualizado.

## 4. Riesgos Vinculados
| Riesgo | Tareas que ayudan a mitigarlo |
|--------|------------------------------|
| Dataset variable | T-01, T-02 (normalización y script) |
| Falta traducciones | T-10, T-16 |
| Performance degradada | T-15 (medición temprana) |

## 5. Secuencia Recomendada
T-01 → T-02 → T-03 → T-04 → T-05 → (T-06,T-07) → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15.

---
Listo para /implement o ejecución manual de desarrollo.
