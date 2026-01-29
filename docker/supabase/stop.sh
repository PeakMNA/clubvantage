#!/bin/bash

# ClubVantage Local Supabase Stop Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 Stopping Supabase services..."

# Stop all services
docker compose down

echo "✅ Supabase services stopped"
echo ""
echo "💡 To remove volumes (reset database): docker compose down -v"
