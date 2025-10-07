# Silksong 100% Checklist

Aplicación estática pura servida con GitHub Pages. Sin build step obligatorio.

<!-- Deploy trigger with cache invalidation - 2025-10-01 -->

## Estructura mínima
```
index.html
manifest.webmanifest
robots.txt
sitemap.xml
privacy.html
assets/ (imágenes, favicons, logos)
data/silksong_items.json (dataset principal)
src/js/*.js (lógica UI, progreso, i18n)
src/i18n/en.json / es.json (traducciones)
```

## Características
- Checklist interactivo (localStorage)
- i18n EN/ES
- Carga diferida de anuncios (AdSense)
- Progreso ponderado
- Fallback no‑JS básico

## Analítica (GA4) – Taxonomía de eventos
Se ha centralizado la instrumentación en `src/js/analytics.js` para reducir ruido y aportar contexto semántico. Todos los eventos usan `gtag('event', ...)` con parámetros enriquecidos.

### Propiedades de usuario (user_properties)
- `locale`: `en` | `es`
- `returning_user`: `yes` | `no`
- `stored_progress_percent`: Porcentaje core guardado al iniciar sesión.
- `device_breakpoint`: `xs|sm|md|lg`
- `session_id`: ID aleatorio por pestaña (sessionStorage).

### Eventos clave
| Evento | Cuándo | Parámetros principales |
|--------|-------|------------------------|
| `item_completed` / `item_unchecked` | Toggle de item | `item_id`, `item_name`, `item_category`, `item_weight`, `optional`, `progress_percent`, `progress_percent_floor`, `core_completed`, `core_total`, `optional_completed`, `optional_total` |
| `category_completed` | Último ítem core de categoría marcado | `category`, `category_core_total`, `progress_percent` |
| `progress_milestone` | Al alcanzar 25/50/75/90% (primera vez) | `milestone`, `progress_percent` |
| `full_completion` | 100% core alcanzado (primera vez) | `core_total`, `core_completed`, `optional_completed`, `optional_total` |
| `scroll_milestone` | Scroll alcanza 25/50/75/90/100% | `milestone` |
| `session_summary` | Al ocultar pestaña / beforeunload | `duration_sec`, `toggles`, `core_percent`, `core_completed`, `core_total` |
| `visibility_change` | Cambios visible/hidden | `state`, (`visible_ms` cuando hidden) |
| `language_change` | Cambio de idioma | `event_label`=nuevo idioma |
| `checklist_reset` | Reset confirmada | `completed_before_reset`, `value` |
| `search` | Búsqueda tras debounce | `search_term`, `results_visible` |
| `feedback_open` | Abrir modal feedback | (contexto mínimo) |
| `feedback_submit` | Enviar feedback OK | `event_label`=tipo, `value`=progress |

### Notas
- Los hitos (milestones) se guardan en `localStorage` para no duplicar durante visitas posteriores.
- `session_summary` reinicia contadores tras cada envío (segmentos de visibilidad).
- Para depurar: `window._analyticsDebug` expone `milestones()`.

### Extender
Para nuevos eventos: añadir función en `analytics.js` evitando duplicar parámetros ya incluidos en otros eventos salvo que cambien semánticamente.


## Ejecutar localmente
Sin dependencias: cualquier server estático.
Ejemplo rápido:
```bash
python -m http.server 8000
```
Abrir: http://localhost:8000

## Despliegue (GitHub Pages)
Solo push a `main`. No se requiere build; los artefactos ya están en el repositorio.

## Mantenimiento
- Actualiza `sitemap.xml` manualmente si cambian URLs.
- Incrementa `CACHE_NAME` en `src/js/sw.js` si mantienes service worker y modificas assets críticos.
- Reemplaza imágenes en `assets/images/` según necesidad.
- Mantén `ads.txt` en la raíz con tu línea de AdSense (y otras redes si las añades) para mejorar transparencia de inventario publicitario.

## Quitar aún más
Si quieres todavía menos:
- Elimina service worker `src/js/sw.js` y registro en `main.js`.
- Elimina AdSense si no monetizas.
- Sustituye lista dinámica fallback por `<noscript>` estático.

## Licencia
Puedes añadir una licencia (MIT recomendada) si vas a abrirlo públicamente.

<!-- deploy trigger: test webhook injection -->
