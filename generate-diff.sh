#!/bin/bash

# Check if two arguments are provided
if [ $# -ne 2 ]; then
    echo "Error: Two directory arguments are required."
    echo "Usage: $0 <directory1> <directory2>"
    echo "Example: $0 example-fresh-v21-2-2 example-fresh-v22-0-0"
    exit 1
fi

# Compare directories directly
dir1="$1"
dir2="$2"
echo "Comparing directory ${dir1} and ${dir2}"

diff -ruN "${dir1}" "${dir2}" > diff.diff

npm run show-diff

echo "Done!"