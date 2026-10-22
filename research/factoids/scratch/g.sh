#!/bin/zsh
# g.sh <sha-prefix-or-url-substring> <regex> : print matching lines (trimmed to 400 chars) from saved page
f=$(grep -l "^URL: .*$1" pages/*.txt | head -1)
[ -z "$f" ] && f=$(ls pages/$1*.txt | head -1)
echo "== $f"; grep -iE "$2" "$f" | cut -c1-500 | head -${3:-8}
