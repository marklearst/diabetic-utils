#!/bin/bash

# ezcommit.sh: Easy, consistent git commit helper
# Usage: Stage your files, then run ./ezcommit.sh

# Get staged files
files=($(git diff --cached --name-only))

if [ ${#files[@]} -eq 0 ]; then
  echo "No staged files. Please stage your changes first."
  exit 1
fi

read -p "Commit title: " title

if [ ${#files[@]} -eq 1 ]; then
  read -p "Commit body: " body
  git commit -m "$title" -m "$body"
else
  body=""
  for f in "${files[@]}"; do
    body+="- $f\n"
  done
  git commit -m "$title" -m "$(echo -e "$body")"
fi

git push