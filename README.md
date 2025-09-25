# Proyecto Spec-Driven Development con Spec Kit

Este repositorio se inicializa para trabajar con Spec Kit (Specify CLI) y (opcionalmente) integrarse con Jules. 

## Objetivo
Arrancar rápidamente un flujo de Spec-Driven Development: definir principios (/constitution), especificaciones (/specify), plan técnico (/plan), tareas (/tasks) y ejecución (/implement).

## 1. Prerrequisitos
- Windows 10/11
- WSL2 o Git Bash (recomendado WSL2 para mejor compatibilidad)  
- Python 3.11 o superior (no uses Microsoft Store si puedes evitarlo)  
- Git instalado (`git --version`)  
- Acceso a un agente de IA (GitHub Copilot en VS Code ya presente)  
- (Opcional) Token de GitHub en variable de entorno `GITHUB_TOKEN` o `GH_TOKEN` si vas a hacer muchas peticiones API.

## 2. Instalar `uv`
`uv` es el gestor rápido de Python usado por Spec Kit.

### Opción A (Git Bash / WSL / PowerShell con curl)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
Esto añadirá `~/.local/bin` a tu PATH (si no, hazlo manualmente).

Verifica:
```bash
uv --version
```

### Opción B (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -Command "iwr https://astral.sh/uv/install.ps1 -UseBasicParsing | iex"
```

## 3. Instalar Specify CLI (Spec Kit)
Instalación persistente (recomendada):
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```
Verifica:
```bash
specify check
```

## 4. Inicializar el proyecto en este directorio
Como este repo ya existe y está vacío:
```bash
specify init --here --ai copilot
```
Opciones útiles:
- `--force` si hubiera ya archivos y quieres fusionar plantillas.
- `--no-git` si NO quieres que inicialice git (ya lo tenemos, así que no necesario).
- `--script ps` si quisieras scripts PowerShell en lugar de bash.

## 5. Flujo de trabajo de Spec-Driven Development
Después de `specify init` podrás usar los slash commands con tu agente Copilot (en la ventana/chat de la herramienta):
1. `/constitution`  – Principios de arquitectura, calidad, criterios de aceptación generales.
2. `/specify`       – Qué quieres construir (requisitos, historias de usuario, alcance). 
3. `/clarify`       – (Opcional pero recomendado) Aclara huecos antes de planificar. 
4. `/plan`          – Plan técnico: stack, módulos, límites, persistencia, despliegue.
5. `/tasks`         – Lista de tareas accionables.
6. `/analyze`       – Revisa consistencia entre artefactos (entre /tasks y /plan). 
7. `/implement`     – Genera e itera sobre la implementación.

Repite desde `/specify` o `/plan` cuando agregues nuevas features.

## 6. Variables de entorno útiles
Si trabajas sin ramas git y quieres fijar una feature concreta:
```bash
export SPECIFY_FEATURE=001-nombre-feature
```
(Establécelo antes de usar `/plan` o comandos posteriores.)

## 7. Integración con Jules
El dominio `https://jules.google.com/` requiere autenticación de Google y (al momento de escribir esto) no expone públicamente documentación de instalación tipo CLI.

Posibles escenarios:
- Si Jules es una interfaz web: simplemente úsala para generar especificaciones y copia/pega los artefactos resultantes en este repo antes de correr `/plan` o `/tasks`.
- Si tienes acceso a un CLI interno de Jules (privado): comparte el comando de instalación o binario y añadiremos scripts de integración.

Por favor confirma qué tipo de acceso tienes a Jules para añadir pasos automatizados.

## 8. Script de bootstrap rápido
Se incluye `scripts/bootstrap_spec_kit.sh` para automatizar instalación (si ya tienes `uv`).
```bash
bash scripts/bootstrap_spec_kit.sh
```

## 9. Próximos pasos sugeridos
1. Ejecuta `uv tool install ...` y `specify init --here --ai copilot`.
2. Crea la constitución: pide a Copilot `/constitution` centrado en: testing (>=80% cobertura crítica), estándares de código, seguridad (dependabot + escaneo SAST), performance (p95 latencia < 300ms para endpoints clave), accesibilidad (WCAG AA), i18n.
3. Define primera feature con `/specify`.
4. Completa `/clarify` y luego `/plan`.
5. Genera `/tasks`, valida con `/analyze` y ejecuta `/implement`.

## 10. Troubleshooting rápido
| Problema | Solución |
|----------|----------|
| `specify: command not found` | Asegura que `~/.local/bin` está en PATH o reinstala uv. |
| Error SSL (corporativo) | Usa `--skip-tls` (no recomendado) o configura certificados corporativos. |
| Python < 3.11 | Instala Python 3.11+ y reinicia la shell. |
| Lentitud en Windows | Usa WSL2 (Ubuntu) y repite instalación dentro de WSL. |

## 11. Licencia
Consulta la licencia MIT de Spec Kit en su repo. Este proyecto inicial puede añadirse la misma o una propia.

---
Si compartes más detalles sobre Jules, ampliaré esta sección con integración concreta.
