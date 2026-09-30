#!/usr/bin/env bash
# Shared identity resolution — sourced by scripts/agents.sh and the pre-commit hook.
# Single source of truth for who is who; don't duplicate the alias list elsewhere.

FINANCEU_KNOWN="thomas josh"

# Git usernames don't reliably contain first names (Josh's is "Jfurts"), so each person
# gets explicit aliases, matched against both `git config user.name` and `user.email`.
# New machine or changed git name? Add the alias here — this one place.
financeu_aliases_for() {
  case "$1" in
    thomas) echo "thomas trmarchildon trmarch1ldon" ;;
    josh) echo "josh jfurts" ;;
  esac
}

# financeu_resolve_me [explicit-name] → prints the slug, or nothing if unresolvable.
# Precedence: explicit argument > FINANCEU_AGENT env var > alias match.
financeu_resolve_me() {
  me="${1:-${FINANCEU_AGENT:-}}"
  if [ -z "$me" ]; then
    raw="$(printf '%s %s' "$(git config user.name 2>/dev/null)" \
                          "$(git config user.email 2>/dev/null)" | tr '[:upper:]' '[:lower:]')"
    for n in $FINANCEU_KNOWN; do
      for a in $(financeu_aliases_for "$n"); do
        case "$raw" in *"$a"*)
          me="$n"
          break 2
          ;;
        esac
      done
    done
  fi
  me="$(printf '%s' "$me" | tr '[:upper:]' '[:lower:]')"
  case " $FINANCEU_KNOWN " in
    *" $me "*) printf '%s' "$me" ;;
    *) printf '' ;;
  esac
}

# The other person's slug.
financeu_other() {
  for n in $FINANCEU_KNOWN; do
    [ "$n" != "$1" ] && printf '%s' "$n"
  done
}
