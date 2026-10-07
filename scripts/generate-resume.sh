#!/usr/bin/env bash

set -euo pipefail

MASTER_RESUME="data/master-resume.json"
JOB_DESCRIPTION="data/inbox/job.txt"
OUTPUT_SCHEMA="data/resume-copilot-output.schema.json"
OUTPUT_FILE="data/generated/result.json"

for file in "$MASTER_RESUME" "$JOB_DESCRIPTION" "$OUTPUT_SCHEMA"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

mkdir -p data/generated

echo "Generating tailored resume..."

{
  echo '=== MASTER RESUME ==='
  cat "$MASTER_RESUME"
  echo
  echo '=== JOB DESCRIPTION ==='
  cat "$JOB_DESCRIPTION"
  echo
  echo 'Generate the Resume Copilot payload using the project instructions.'
} | codex exec \
  --sandbox read-only \
  --output-schema "$OUTPUT_SCHEMA" \
  --output-last-message "$OUTPUT_FILE" \
  -

echo
echo "Generated:"
echo "$OUTPUT_FILE"
