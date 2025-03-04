#!/usr/bin/bash

ollama serve
docker start postgres-r2r-test
export R2R_CONFIG_PATH=$PWD/test-data/r2r_config.toml
source ./venv/bin/activate
python -m r2r.serve
