#!/usr/bin/env zsh
# filepath: calculate_wer.sh
# Script was generated automatically using Claude Haiku 4.5 

set -euo pipefail

usage() {
  echo "Usage: $0 <substitutions> <deletions> <insertions> <references>"
  echo ""
  echo "Calculate Word Error Rate (WER) = (S + D + I) / N"
  echo "  substitutions: number of word substitutions"
  echo "  deletions:     number of word deletions"
  echo "  insertions:    number of word insertions"
  echo "  references:    total number of reference words"
  exit 2
}

if [ "$#" -ne 4 ]; then usage; fi

substitutions="$1"
deletions="$2"
insertions="$3"
references="$4"

# Validate inputs are non-negative integers
for arg in "$substitutions" "$deletions" "$insertions" "$references"; do
  if ! [[ "$arg" =~ ^[0-9]+$ ]]; then
    echo "Error: all arguments must be non-negative integers"
    exit 1
  fi
done

# Handle division by zero
if [ "$references" -eq 0 ]; then
  if [ "$((substitutions + deletions + insertions))" -eq 0 ]; then
    wer=0.0
    echo "WER: 0.0 (0.00%)"
  else
    echo "Error: cannot calculate WER with 0 reference words but non-zero errors"
    exit 1
  fi
else
  # Calculate WER = (S + D + I) / N
  wer=$(awk "BEGIN {printf \"%.6f\", ($substitutions + $deletions + $insertions) / $references}")
  wer_percent=$(awk "BEGIN {printf \"%.2f\", ($substitutions + $deletions + $insertions) / $references * 100}")
  
  echo "WER: $wer ($wer_percent%)"
fi
