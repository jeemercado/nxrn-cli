#!/bin/bash

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "Error: No argument provided."
    echo "Usage: $0 <directory_name>"
    exit 1
fi

# Store the argument in a variable
directory_name="$1"
echo "Comparing directory example/${directory_name} and example-fresh/${directory_name}"

diff -ruN example/${directory_name} example-fresh/${directory_name} > diff.diff

npm run show-diff

echo "Done!"