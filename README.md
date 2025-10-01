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
