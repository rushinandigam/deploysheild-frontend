# DeploySheild frontend — use from this directory (frontend repo root).
# Copy .env.example to .env; set VITE_API_BASE_URL to your API URL.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

-include .env

FRONTEND_PORT ?= 5173

.PHONY: help install dev build preview lint

help:
	@echo "Targets:"
	@echo "  make install   pnpm install"
	@echo "  make dev       Vite dev server"
	@echo "  make build     production build"
	@echo "  make preview   preview production build"
	@echo "  make lint      eslint"

install:
	pnpm install

dev:
	@test -d node_modules || (echo "Run: make install" && exit 1)
	pnpm exec vite --port "$(FRONTEND_PORT)"

build:
	pnpm run build

preview:
	pnpm run preview

lint:
	pnpm run lint
