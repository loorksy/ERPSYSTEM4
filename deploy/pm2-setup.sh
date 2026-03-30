#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/lorkerp"

echo "[1/6] تثبيت متطلبات النظام"
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip nodejs npm postgresql

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[2/6] تثبيت PM2"
  sudo npm i -g pm2
fi

echo "[3/6] تجهيز backend"
cd "$APP_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "[4/6] تجهيز frontend"
cd "$APP_DIR/frontend"
npm ci
npm run build

if ! npx --yes serve --version >/dev/null 2>&1; then
  npm i serve
fi

echo "[5/6] تشغيل الخدمات عبر PM2"
cd "$APP_DIR"
pm2 start deploy/ecosystem.config.cjs
pm2 save

if command -v systemctl >/dev/null 2>&1; then
  echo "[6/6] تفعيل pm2 startup"
  pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | bash || true
fi

echo "✅ تم. الواجهة على 3023 والباكند على 8000"
