#!/usr/bin/env bash
# Generic secret scan (no real values inside). Usage: tests/scan-secrets.sh [dir]  - exit 1 if anything is found.
cd "${1:-.}" || exit 2
bad=0
scan() { # description, pattern
  hits=$(git ls-files -z 2>/dev/null | xargs -0 grep -InE -e "$2" 2>/dev/null | grep -vE 'scan-secrets\.sh|secrets\.yaml\.example' | cut -d: -f1,2 | head -5)
  [ -n "$hits" ] && { echo "!! $1:"; echo "$hits"; bad=1; }
}
scan "GitHub token"            'gh[pousr]_[A-Za-z0-9]{20,}'
scan "base64 32-byte key"      '(key|psk|secret|token)[^#\n]*[A-Za-z0-9+/]{43}='
scan "inline password"         '(password|passwd|pwd)[A-Za-z_]*: *["'"'"'][^"'"'"'!$]{4,}'
scan "private IPv4"            '\b(192\.168|10\.[0-9]+|172\.(1[6-9]|2[0-9]|3[01]))\.[0-9]+\.[0-9]+\b'
scan "e-mail address"          '[A-Za-z0-9._%+-]+@(gmail|outlook|wp|o2|interia|yahoo|icloud)\.[a-z]+'
scan "bearer / long JWT"       'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}'
scan "meter / PPE number"      '\b[0-9]{18}\b'
[ $bad -eq 0 ] && echo "scan-secrets: clean"
exit $bad
