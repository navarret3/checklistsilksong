#!/usr/bin/env bash
set -euo pipefail

# Bootstrap script to install uv (if missing) and Specify CLI (Spec Kit)
# Usage: bash scripts/bootstrap_spec_kit.sh [--force]
# Requires: curl, Python 3.11+, git

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

command -v python >/dev/null 2>&1 || { echo "[ERROR] Python no encontrado. Instala Python 3.11+"; exit 1; }
PY_VER=$(python - <<'PY'
import sys
print(f"{sys.version_info.major}.{sys.version_info.minor}")
PY
)

MAJOR=${PY_VER%%.*}
MINOR=${PY_VER#*.}
if (( MAJOR < 3 || (MAJOR==3 && MINOR < 11) )); then
  echo "[ERROR] Se requiere Python 3.11+ (actual: $PY_VER)"; exit 1;
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "[INFO] Instalando uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  echo "[INFO] uv instalado. Asegura que ~/.local/bin está en tu PATH" 
fi

echo "[INFO] Instalando/Actualizando Specify CLI..."
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git --force-reinstall

echo "[INFO] Verificando instalación..."
if ! command -v specify >/dev/null 2>&1; then
  echo "[ERROR] specify no apareció en PATH. Añade ~/.local/bin a tu PATH y reintenta."; exit 1;
fi

if [[ $FORCE -eq 1 ]]; then
  echo "[INFO] Ejecutando specify init --here --force --ai copilot" 
  specify init --here --force --ai copilot || true
else
  echo "[INFO] Para inicializar en el directorio actual ejecuta:" 
  echo "       specify init --here --ai copilot"
fi

echo "[DONE] Listo. Usa los slash commands en tu agente: /constitution, /specify, /plan, /tasks, /analyze, /implement"
