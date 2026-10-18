#!/bin/bash
set -e
python data/seed.py
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
