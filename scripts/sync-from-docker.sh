#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Sync forecast data from Docker PostgreSQL → Neon
#
# Usage:
#   chmod +x scripts/sync-from-docker.sh
#   ./scripts/sync-from-docker.sh
#
# Prerequisites:
#   - Docker container petrol-db running with data
#   - DATABASE_URL set in .env (Neon connection string)
#   - psql installed locally (for Neon connection)
# ──────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."

# Load Neon connection string from .env
export "$(grep -E '^DATABASE_URL=' .env)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

# Check Docker is running
if ! docker exec petrol-db psql -U postgres -d petrol_pump -c "SELECT 1" >/dev/null 2>&1; then
  echo "❌ Cannot connect to Docker PostgreSQL (petrol-db)"
  exit 1
fi

echo "🚀 Syncing forecast data from Docker PostgreSQL → Neon..."

TABLES=(
  "daily_forecast_quantiles"
  "daily_financial_summary"
  "daily_order_recommendation"
  "daily_forecast_costs"
  "quantile_model_metrics"
  "conformal_calibration"
)

for table in "${TABLES[@]}"; do
  echo -n "  Syncing ${table}... "

  # Check if table exists in Docker and has rows
  ROWS=$(docker exec petrol-db psql -U postgres -d petrol_pump -t -A -c "SELECT COUNT(*) FROM ${table};" 2>/dev/null || echo "0")

  if [ "$ROWS" = "0" ] || [ "$ROWS" = "" ]; then
    echo "⚠️  empty or not found, skipping"
    continue
  fi

  # Dump as CSV and pipe into Neon
  docker exec petrol-db psql -U postgres -d petrol_pump \
    -c "COPY ${table} TO STDOUT WITH CSV HEADER" 2>/dev/null | \
    psql "${DATABASE_URL}" \
    -c "TRUNCATE ${table}; COPY ${table} FROM STDIN WITH CSV HEADER" 2>/dev/null && \
    echo "✅ ${ROWS} rows" || echo "❌ failed"
done

echo ""
echo "✅ Sync complete! Dashboard data is now live."
