#!/bin/bash

# Check if two version arguments are provided
if [ $# -lt 2 ]; then
    echo "Error: Two version arguments are required."
    echo "Usage: $0 <version1> <version2>"
    echo "Example: $0 21.2.2 22.0.0"
    exit 1
fi

VERSION1="$1"
VERSION2="$2"
PROJECT1="example"
PROJECT2="example-fresh"

echo "=========================================="
echo "Comparing Nx versions:"
echo "  Version 1: ${VERSION1} -> ${PROJECT1}"
echo "  Version 2: ${VERSION2} -> ${PROJECT2}"
echo "=========================================="
echo ""

# Clean up existing directories
echo "Cleaning up existing directories..."
rm -rf "${PROJECT1}" "${PROJECT2}"

# Build and relink the CLI
echo "Building and relinking CLI..."
npm run relink

# Create first project with version 1
echo ""
echo "Creating project 1 with Nx version ${VERSION1}..."
npx nx-react-native-cli create "${PROJECT1}" com.jeemercado.example --nx-version "${VERSION1}" --skip-install

# Create second project with version 2
echo ""
echo "Creating project 2 with Nx version ${VERSION2}..."
npx nx-react-native-cli create "${PROJECT2}" com.jeemercado.example --fresh --nx-version "${VERSION2}" --skip-install

# Delete node_modules on both projects
echo ""
echo "Deleting node_modules on both projects..."
rm -rf "${PROJECT1}/node_modules" "${PROJECT2}/node_modules"

# Delete .nx folder on both projects
echo ""
echo "Deleting .nx folder on both projects..."
rm -rf "${PROJECT1}/.nx" "${PROJECT2}/.nx"

# Delete apps/mobile/src on both projects
echo ""
echo "Deleting apps/mobile/src on both projects..."
rm -rf "${PROJECT1}/apps/mobile/src" "${PROJECT2}/apps/mobile/src"

# Generate diff between both projects
echo ""
echo "Generating diff between both projects..."
npm run generate-diff "${PROJECT1}" "${PROJECT2}"

echo ""
echo "=========================================="
echo "✅ Comparison projects created successfully!"
echo "=========================================="
echo ""
echo "Projects created:"
echo "  - ${PROJECT1} (Nx ${VERSION1})"
echo "  - ${PROJECT2} (Nx ${VERSION2})"
echo ""
echo "You can now compare the differences between these projects."
