#!/usr/bin/env bash
# Batch runner for query_api.js: queries the given API once per row of a CSV
# file and prints the combined results as a single JSON array.
#
# Usage: batch_query_api.sh <api> <csv-file>
#   api       api: geocoding | siret, forwarded as-is to query_api.js
#   csv-file  path to a CSV file with a header row; the first column of each
#             data row is used as the query string; one query per row

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: batch_query_api.sh <api> <csv-file>" >&2
  exit 1
fi

api="$1"
csv_file="$2"

if [ ! -f "$csv_file" ]; then
  echo "csv-file not found: $csv_file" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

results=()
while IFS=, read -r query _rest; do
  query="${query%$'\r'}"
  [ -z "$query" ] && continue

  results+=("$(node "$script_dir/query_api.js" "$api" "$query")")
done < <(tail -n +2 "$csv_file")

(
  IFS=,
  printf '[%s]\n' "${results[*]:-}"
)
