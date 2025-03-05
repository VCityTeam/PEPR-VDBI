#!/usr/bin/bash

ollama serve &
docker start postgres-r2r-test

source ./venv/bin/activate
export R2R_CONFIG_PATH=$PWD/test-data/r2r-test/r2r_config.toml
python -m r2r.serve &
