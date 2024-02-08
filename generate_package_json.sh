#!/bin/bash
cp package.json package.json.bk
./jpkl eval --format json package.json.pkl > package.json
