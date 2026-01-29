#!/bin/bash

# ClubVantage Local Supabase Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting local Supabase..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Pull latest images (optional, skip with --no-pull)
if [[ "$1" != "--no-pull" ]]; then
    echo "📦 Pulling Supabase images..."
    docker compose pull
fi

# Start services
echo "🐳 Starting Supabase services..."
docker compose up -d

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
until docker exec supabase-db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done
echo "✅ Database is ready"

# Wait for analytics to be healthy (required for other services)
echo "⏳ Waiting for analytics service..."
for i in {1..30}; do
    if docker inspect --format='{{.State.Health.Status}}' supabase-analytics 2>/dev/null | grep -q "healthy"; then
        echo "✅ Analytics is ready"
        break
    fi
    sleep 2
done

# Setup required schemas and roles
echo "🔧 Setting up database schemas and roles..."
docker exec supabase-db psql -U supabase_admin -c "
-- Create required schemas
CREATE SCHEMA IF NOT EXISTS _analytics;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS _realtime;

-- Set schema ownership
ALTER SCHEMA _analytics OWNER TO supabase_admin;

-- Grant permissions to Supabase roles
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Set passwords for internal roles
ALTER USER authenticator WITH PASSWORD 'clubvantage-dev-password-2025';
ALTER USER pgbouncer WITH PASSWORD 'clubvantage-dev-password-2025';
ALTER USER supabase_auth_admin WITH PASSWORD 'clubvantage-dev-password-2025';
ALTER USER supabase_storage_admin WITH PASSWORD 'clubvantage-dev-password-2025';

-- Fix auth schema ownership
ALTER SCHEMA auth OWNER TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
" 2>/dev/null || true

# Fix auth function ownership
docker exec supabase-db psql -U supabase_admin -c "
DO \$\$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth'
  LOOP
    EXECUTE format('ALTER FUNCTION auth.%I(%s) OWNER TO supabase_auth_admin', func_record.proname, func_record.args);
  END LOOP;
END
\$\$;
" 2>/dev/null || true

# Restart auth service to pick up changes
docker restart supabase-auth > /dev/null 2>&1

# Wait a moment for services to stabilize
sleep 5

# Check service status
echo ""
echo "📊 Service status:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | head -15

echo ""
echo "✅ Supabase is running!"
echo ""
echo "📍 Access points:"
echo "   • Studio:     http://localhost:8000"
echo "                 Login: supabase / ClubVantage2025Dev"
echo "   • REST API:   http://localhost:8000/rest/v1/"
echo "   • Auth API:   http://localhost:8000/auth/v1/"
echo "   • Database:   postgresql://postgres:clubvantage-dev-password-2025@localhost:54399/postgres"
echo "   • Pooler:     postgresql://postgres:clubvantage-dev-password-2025@localhost:6543/postgres"
echo ""
echo "🔧 Next steps:"
echo "   1. cd ../../database && npx prisma db push"
echo "   2. cd ../../database && npx prisma db seed"
echo "   3. pnpm --filter api dev"
echo "   4. pnpm --filter @clubvantage/application dev"
echo ""
echo "💡 Tips:"
echo "   • Use './start.sh --no-pull' to skip pulling images"
echo "   • Use './stop.sh' to stop all services"
echo "   • Use 'docker compose logs -f [service]' to view logs"
