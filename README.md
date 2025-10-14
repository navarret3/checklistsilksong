<h1 align="center">Silksong 100% Checklist</h1>
<p align="center">
Una checklist interactiva no oficial para seguir tu progreso en <strong>Hollow Knight: Silksong</strong> rumbo al 100%.
<br>
<a href="https://checklistsilksong.com" target="_blank"><b>Ir a la aplicación →</b></a>
</p>

<p align="center">
<img src="assets/images/ss3.png" alt="Silksong logo" width="96" height="96">
</p>

---

## 🌟 ¿Qué es?
Una página sencilla y rápida (sin registros) donde marcas objetos, mejoras, fragmentos, habilidades y otros elementos del juego para saber cuánto te falta. Todo se guarda automáticamente en tu navegador.

## ✨ Características principales
- Progreso automático guardado (localStorage).
- Distinción entre elementos esenciales y opcionales.
- Idiomas: Inglés y Español (cambio instantáneo desde el selector).
- Exportar / importar tu progreso para llevarlo a otro dispositivo.
- Interfaz adaptada a móvil y escritorio.
- Modal de información y botón de Feedback para sugerencias o reportes.

## 🚀 Cómo usarla
1. Entra a la web y espera que cargue la lista.
2. Marca cada ítem que obtengas en el juego.
3. Observa el porcentaje y los elementos restantes.
4. Exporta tu progreso si quieres una copia de seguridad (botón Export), e impórtalo cuando cambies de dispositivo.
5. Usa el buscador para filtrar ítems rápidamente.

## 🗣 Feedback y sugerencias
Pulsa el botón “Feedback” dentro de la aplicación. Puedes reportar datos incorrectos, ideas o bugs. ¡Las contribuciones ayudan a mejorar la herramienta!

## 🧩 Traducciones
Actualmente: EN / ES. Si deseas colaborar con otro idioma, abre un issue o envía feedback indicando el idioma que quieres aportar.

## 🛣 Pequeño roadmap (orientativo)
- Mejoras visuales y accesibilidad.
- Posible añadido de más idiomas.
- Ajustes de datos cuando haya nueva información oficial.

## 🙌 Créditos & Agradecimientos
Proyecto hecho por fans para fans. No afiliado ni respaldado por Team Cherry. Gracias a la comunidad por la recopilación y validación de datos.

## 📄 Privacidad
No pedimos cuentas ni contraseñas. El progreso vive en tu dispositivo. Solo se usan métricas anónimas agregadas para entender uso general.

## 📊 Eventos GA4 (Instrumentación)
La aplicación envía eventos anónimos para entender el uso y priorizar mejoras. Principales eventos:

| Evento | Cuándo se dispara | Parámetros clave |
|--------|-------------------|------------------|
| item_completed / item_unchecked | Marcar / desmarcar un ítem | item_id, item_category, progress_percent, optional |
| category_completed | Se completa una categoría core | category, progress_percent |
| progress_milestone | Se alcanza 25, 50, 75 o 100% | milestone, progress_percent |
| progress_quartile | Se alcanza 25, 50 o 75% (alias para dashboards) | quartile, progress_percent |
| full_completion | 100% core alcanzado | core_total, core_completed |
| checklist_reset | Reset manual | completed_before_reset |
| search | Búsqueda (tras leve debounce) | search_term, results_visible |
| language_change | Cambio de idioma | locale |
| visibility_change | Pestaña se oculta o muestra | state, visible_ms |
| scroll_milestone | Scroll alcanza 25/50/75/100% página | milestone |
| session_summary | Al cambiar de pestaña (hidden) o unload | duration_sec, toggles, core_percent |

Dimensiones recomendadas en GA4 (Custom definitions):
- progress_percent (Number) – usa event parameter.
- item_category (Text).
- locale (Text).
- quartile (Number) para progress_quartile.

Sugerencias de dashboards:
1. Tabla de conversión: Usuarios vs milestones (usar progress_milestone + full_completion).  
2. Funnel de quartiles: 0 → 25 → 50 → 75 → 100 (usar progress_quartile + full_completion).  
3. Distribución de categorías completadas (conteo de category_completed).  
4. Engagement: item_completed por sesión / session_summary.duration_sec.

Debug local rápido:
1. Abrir DevTools y ejecutar: `window.gtag = (...a)=>{console.log('GTAG',a); dataLayer.push(a);}` antes de interactuar.
2. Activar GA DebugView (extensión Chrome o `gtag('config','G-XXXX',{debug_mode:true});`).
3. Verificar que se disparan progress_milestone y progress_quartile al editar el progreso (puedes simular marcando muchos ítems rápido).


## ⚖️ Disclaimer
No es un producto oficial de Team Cherry. Hollow Knight: Silksong y todos los elementos relacionados pertenecen a sus respectivos dueños.

## 🛠 ¿Quieres clonar el proyecto?
Es un sitio estático. Puedes abrirlo con cualquier servidor local sencillo. (Detalles técnicos intencionalmente omitidos aquí para mantener el README ligero.)

---
<p align="center">Hecho con cariño por la comunidad de Silksong 🐛</p>
