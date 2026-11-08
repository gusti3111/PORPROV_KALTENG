#!/usr/bin/env bash
# setup-vps.sh — Install Docker & docker compose pada Ubuntu VPS.
# Idempotent (boleh dijalankan ulang). Harus dijalankan dengan sudo.

set -euo pipefail

log() { echo "[setup-vps] $*"; }

# 1) Install docker.io jika belum ada
if ! command -v docker >/dev/null 2>&1; then
  log "Docker belum terinstall."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y docker.io
fi
log "Docker sudah terinstall."

# 2) Pastikan daemon berjalan
if ! docker info >/dev/null 2>&1; then
  log "Docker daemon belum berjalan. Memulai..."
  systemctl enable --now docker
fi
log "Docker daemon berjalan."

# 3) Install docker compose plugin jika belum ada
if ! docker compose version >/dev/null 2>&1; then
  log "docker compose belum tersedia."
  apt-get update -y
  apt-get install -y docker-compose-plugin
fi
log "docker compose tersedia."

log "Selesai: VPS siap menerima docker compose."
