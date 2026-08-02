#!/usr/bin/env sh
set -eu

WEB_URL="${WEB_URL:-http://localhost:5173}"
API_URL="${API_URL:-http://localhost:8080}"
export API_URL

wait_for() {
  name="$1"
  url="$2"
  attempts="${3:-60}"
  index=1
  while [ "$index" -le "$attempts" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "PASS $name $url"
      return 0
    fi
    sleep 2
    index=$((index + 1))
  done
  echo "FAIL $name $url" >&2
  return 1
}

wait_for "API health" "$API_URL/actuator/health"
wait_for "OpenAPI document" "$API_URL/v3/api-docs"
wait_for "Swagger UI" "$API_URL/swagger-ui/index.html"
wait_for "Landing" "$WEB_URL/"
wait_for "Login route" "$WEB_URL/login"
wait_for "Register route" "$WEB_URL/register"
wait_for "Admin route" "$WEB_URL/admin"

python3 "$(dirname "$0")/api-smoke.py"
node "$(dirname "$0")/realtime-smoke.mjs"

echo "PASS complete HTTP, authenticated API, storage, moderation, and realtime smoke suite"
