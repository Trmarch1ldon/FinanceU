#!/usr/bin/env bash
# Read half of the coordination ritual (.agents/PROTOCOL.md).
# Fetches origin/main and prints what the other agent is doing RIGHT NOW.
#
#   ./scripts/agents.sh            # figures out who you are from git config user.name
#   ./scripts/agents.sh josh       # or tell it explicitly
#
# Reads from origin/main, never your working copy — your local files say nothing
# about what the other agent started ten minutes ago.

set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "not inside a git repository" >&2; exit 1
}
cd "$ROOT" || exit 1

if [ -t 1 ]; then
  B=$'\033[1m'; DIM=$'\033[2m'; R=$'\033[31m'; Y=$'\033[33m'; G=$'\033[32m'; C=$'\033[36m'; X=$'\033[0m'
else
  B=''; DIM=''; R=''; Y=''; G=''; C=''; X=''
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/identity.sh
. "$SCRIPT_DIR/lib/identity.sh"

KNOWN="$FINANCEU_KNOWN"
ME="$(financeu_resolve_me "${1:-}")"

if [ -z "$ME" ]; then
  echo "${R}Can't tell whether you're Thomas or Josh.${X}" >&2
  echo >&2
  echo "  git user.name:  $(git config user.name 2>/dev/null || echo '<unset>')" >&2
  echo "  git user.email: $(git config user.email 2>/dev/null || echo '<unset>')" >&2
  echo "  neither matched a known alias:" >&2
  for n in $KNOWN; do echo "    $n -> $(financeu_aliases_for "$n")" >&2; done
  echo >&2
  echo "${Y}Fix, cheapest first:${X}" >&2
  echo "  ./scripts/agents.sh josh            # one-off" >&2
  echo "  export FINANCEU_AGENT=josh          # this shell" >&2
  echo "  add your alias to financeu_aliases_for() in scripts/lib/identity.sh   # permanent, shared" >&2
  exit 1
fi

OTHER="$(financeu_other "$ME")"

cap() { printf '%s%s' "$(printf '%s' "${1:0:1}" | tr '[:lower:]' '[:upper:]')" "${1:1}"; }
ME_T="$(cap "$ME")"; OTHER_T="$(cap "$OTHER")"

MY_FILE=".agents/status-$ME.md"
THEIR_FILE=".agents/status-$OTHER.md"
TASKS=".agents/TASKS.md"

# --- fetch --------------------------------------------------------------------
printf '%s' "${DIM}fetching origin…${X}"
if git fetch origin --quiet 2>/dev/null; then
  printf '\r%s\n' "${DIM}fetched origin/main$(printf '%*s' 10 '')${X}"
  REF="origin/main"
else
  printf '\r%s\n' "${Y}could not reach origin — showing LOCAL files, which may be stale${X}"
  REF=""
fi

# Print a file as it exists on origin/main (fall back to the working copy).
show() {
  if [ -n "$REF" ] && git cat-file -e "$REF:$1" 2>/dev/null; then
    git show "$REF:$1" 2>/dev/null
  elif [ -f "$1" ]; then
    cat "$1"
  fi
}

# Strip <!-- --> blocks (the templates keep their examples in comments).
strip_comments() {
  awk '/<!--/{c=1} !c{print} /-->/{c=0}'
}

# Pull one "## Heading" section out of a status file.
section() {
  awk -v want="## $2" '
    $0 == want { f=1; next }
    /^## / { f=0 }
    f { print }
  ' <<<"$1" | strip_comments | sed -e 's/[[:space:]]*$//'
}

# Non-empty means: has real content beyond the placeholder.
has_content() {
  [ -n "$(printf '%s' "$1" | grep -v '^[[:space:]]*$' | grep -v '^_Nothing')" ]
}

block() {
  printf '%s' "$1" | grep -v '^[[:space:]]*$' | sed 's/^/  /'
}

THEIRS="$(show "$THEIR_FILE")"
MINE="$(show "$MY_FILE")"
BOARD="$(show "$TASKS")"

echo
echo "${B}════ FinanceU — agent board ════${X}  ${DIM}you are ${ME_T}${X}"

# --- what they are holding ----------------------------------------------------
echo
echo "${B}${C}$OTHER_T is working on${X}"
their_now="$(section "$THEIRS" "Now")"
if has_content "$their_now"; then
  block "$their_now"

  if [ -n "$REF" ]; then
    ts="$(git log -1 --format=%ct "$REF" -- "$THEIR_FILE" 2>/dev/null)"
    if [ -n "$ts" ]; then
      hours=$(( ( $(date +%s) - ts ) / 3600 ))
      if [ "$hours" -ge 24 ]; then
        echo
        echo "  ${Y}⚠ this claim is ${hours}h old — probably an abandoned session.${X}"
        echo "  ${Y}  Ask $OTHER_T before treating it as free. Do not just take it.${X}"
      else
        echo
        echo "  ${DIM}claimed ${hours}h ago${X}"
      fi
    fi
  fi
  echo
  echo "  ${R}Do not edit the paths above.${X} Need one? Write it under"
  echo "  ${DIM}## Messages to $OTHER_T${X} in $MY_FILE and pick up something else."
else
  echo "  ${DIM}nothing claimed${X}"
fi

# --- messages to me -----------------------------------------------------------
msgs="$(section "$THEIRS" "Messages to $ME_T")"
echo
if has_content "$msgs"; then
  echo "${B}${Y}▶ Messages for you from $OTHER_T${X}"
  block "$msgs"
  echo
  echo "  ${DIM}Reply under '## Messages to $OTHER_T' in $MY_FILE — never edit their file.${X}"
else
  echo "${B}Messages for you${X}"
  echo "  ${DIM}none${X}"
fi

# --- my own last state --------------------------------------------------------
echo
echo "${B}${C}Your last state${X}"
my_now="$(section "$MINE" "Now")"
if has_content "$my_now"; then
  block "$my_now"
else
  echo "  ${DIM}nothing claimed${X}"
fi

my_done="$(section "$MINE" "Done (newest first)")"
if has_content "$my_done"; then
  echo
  echo "  ${DIM}last finished:${X}"
  printf '%s' "$my_done" | grep -v '^[[:space:]]*$' | head -3 | sed 's/^/  /'
fi

# --- the board ----------------------------------------------------------------
echo
echo "${B}In flight${X}"
inflight="$(printf '%s' "$BOARD" | awk -F'|' '
  /^\|/ && $2 !~ /^[[:space:]]*(ID|-+)[[:space:]]*$/ && $2 !~ /^[[:space:]]*:?-/ {
    gsub(/^[ \t]+|[ \t]+$/, "", $2); gsub(/^[ \t]+|[ \t]+$/, "", $3)
    gsub(/^[ \t]+|[ \t]+$/, "", $4); gsub(/^[ \t]+|[ \t]+$/, "", $5)
    gsub(/^[ \t]+|[ \t]+$/, "", $6)
    if ($5 == "wip" || $5 == "review")
      printf "  %-4s %-6s %-8s %s\n", $2, $4, $5, $6
  }')"
if [ -n "$inflight" ]; then
  echo "$inflight"
else
  echo "  ${DIM}nothing in flight${X}"
fi

echo
echo "${B}Open${X}"
printf '%s' "$BOARD" | awk -F'|' -v dim="$DIM" -v x="$X" '
  /^\|/ && $2 !~ /^[[:space:]]*(ID|-+)[[:space:]]*$/ && $2 !~ /^[[:space:]]*:?-/ {
    gsub(/^[ \t]+|[ \t]+$/, "", $2); gsub(/^[ \t]+|[ \t]+$/, "", $3); gsub(/^[ \t]+|[ \t]+$/, "", $5)
    if ($5 == "open") { n++; if (n <= 8) printf "  %-4s %s\n", $2, $3 }
  }
  END { if (n > 8) printf "%s  … and %d more in .agents/TASKS.md%s\n", dim, n - 8, x
        if (n == 0) printf "%s  none%s\n", dim, x }'

# --- next step ----------------------------------------------------------------
echo
echo "${B}${G}To start work${X}  ${DIM}(claim BEFORE you branch)${X}"
cat <<NEXT
  1. pick an open task, check its paths don't overlap $OTHER_T's claim
  2. edit $TASKS      → your name, status wip, branch
  3. edit $MY_FILE    → ## Now block
  4. git add $TASKS $MY_FILE && git commit -m "chore(agents): claim <ID>" && git push origin main
  5. git switch -c <branch>

  full ritual: .agents/PROTOCOL.md
NEXT
echo
