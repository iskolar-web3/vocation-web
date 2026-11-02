#!/usr/bin/env bash
# Mirror the server-owned documents into this repo.
#
# Canonical home for these files is iskolar-web3/vocation-server. They are committed here (not
# gitignored) so an agent reads them on a plain `git clone` — see docs/adr/ADR-0011.
#
# NEVER edit a mirrored file in this repo. Edit it upstream, then re-run this script.
#
# Usage: scripts/sync-docs.sh [ref]     (default: main)
set -euo pipefail

SRC_REPO="iskolar-web3/vocation-server"
SRC_WEB="https://github.com/${SRC_REPO}/blob"
REF="${1:-main}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v gh >/dev/null || { echo "gh CLI required" >&2; exit 1; }

MIRRORED=(
  docs/prd.md
  docs/api-spec.md
  docs/index.md
  docs/onboarding.md
  docs/sad.md
  docs/methods.md
)

SERVER_ONLY=(VOCATION.md erd.md system-design.md implementation-plan.md ops.md)

BANNER='<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->'

fetch() { gh api "repos/${SRC_REPO}/contents/$1?ref=${REF}" --jq '.content' | base64 -d; }

rewrite() {
  local f="$1" depth rel
  depth=$(( $(tr -cd '/' <<<"$f" | wc -c) ))
  rel=""; for _ in $(seq 1 "$depth"); do rel="../${rel}"; done
  for doc in "${SERVER_ONLY[@]}"; do
    perl -pi -e "s{\\(\\Q${rel}${doc}\\E\\)}{(${SRC_WEB}/${REF}/${doc})}g" "${ROOT}/${f}"
    perl -pi -e "s{\\((\\.\\./)?\\Q${doc}\\E\\)}{(${SRC_WEB}/${REF}/docs/${doc})}g" "${ROOT}/${f}"
  done
}

echo "Mirroring from ${SRC_REPO}@${REF}"
for f in "${MIRRORED[@]}"; do
  mkdir -p "${ROOT}/$(dirname "$f")"
  { printf '%s\n\n' "$BANNER"; fetch "$f"; } > "${ROOT}/${f}"
  rewrite "$f"
  echo "  ${f}"
done

rm -rf "${ROOT}/docs/adr"; mkdir -p "${ROOT}/docs/adr"
gh api "repos/${SRC_REPO}/contents/docs/adr?ref=${REF}" --jq '.[] | select(.type=="file") | .path' \
| while read -r p; do
    out="docs/adr/$(basename "$p")"
    { printf '%s\n\n' "$BANNER"; fetch "$p"; } > "${ROOT}/${out}"
    rewrite "$out"
    echo "  ${out}"
  done

# The OpenAPI contract is mirrored verbatim: a YAML file can't carry the HTML banner. Its
# generated types (src/types/schema.ts) are regenerated in the same step, so the mirror and
# the types never disagree (Audit.md CON-09).
fetch docs/openapi.yaml > "${ROOT}/docs/openapi.yaml"
echo "  docs/openapi.yaml"
(cd "${ROOT}" && npm run --silent gen:api)
echo "  src/types/schema.ts (regenerated)"

gh api "repos/${SRC_REPO}/commits/${REF}" --jq '.sha' > "${ROOT}/docs/.synced-from"
echo "Synced from $(cat "${ROOT}/docs/.synced-from")"
