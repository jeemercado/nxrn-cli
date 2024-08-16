#!/bin/bash

cat << EOF > ./ios/.xcode.env.local
export NODE_BINARY=$(which node)
export ENTRY_FILE="\${PROJECT_DIR}/../src/main.tsx"
EOF
