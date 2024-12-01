export PATH := "./node_modules/.bin:" + env_var("PATH")

set dotenv-load


dev:
  concurrently "just dev-client" "just dev-server"

dev-client:
  vite

dev-server:
  tsx --env-file .env server/index.ts

build:
  vite build
  swc server --out-dir build

preview:
  NODE_ENV=production node build/server/index.js
