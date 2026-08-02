#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
WEB_ROOT="$ROOT/apps/web"

python3 "$ROOT/infrastructure/scripts/static-quality.py"

if [ -x "$WEB_ROOT/node_modules/.bin/tsc" ]; then
  echo "Running the installed TypeScript compiler..."
  (cd "$WEB_ROOT" && npm run typecheck)
else
  GLOBAL_NODE_MODULES="$(npm root -g 2>/dev/null || true)"
  TYPESCRIPT_MODULE="$GLOBAL_NODE_MODULES/typescript/lib/typescript.js"

  if [ -f "$TYPESCRIPT_MODULE" ]; then
    TYPESCRIPT_MODULE="$TYPESCRIPT_MODULE" node - "$ROOT" <<'NODE'
const fs = require('fs')
const path = require('path')
const ts = require(process.env.TYPESCRIPT_MODULE)
const root = process.argv[2]
const sourceRoot = path.join(root, 'apps/web/src')
const errors = []

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(target)
      continue
    }
    if (!/\.(ts|tsx)$/.test(target)) continue

    const result = ts.transpileModule(fs.readFileSync(target, 'utf8'), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
      fileName: target,
      reportDiagnostics: true,
    })

    for (const diagnostic of result.diagnostics ?? []) {
      if (diagnostic.category !== ts.DiagnosticCategory.Error) continue
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')
      errors.push(`${path.relative(root, target)}: ${message}`)
    }
  }
}

walk(sourceRoot)
if (errors.length > 0) {
  console.error('TypeScript syntax gate failed:')
  for (const error of errors) console.error(` - ${error}`)
  process.exit(1)
}
console.log('PASS TypeScript syntax gate')
NODE
  else
    echo "SKIP TypeScript syntax gate: install frontend dependencies or global TypeScript."
  fi
fi

echo "Static package verification passed"
