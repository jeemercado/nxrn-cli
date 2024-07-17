#!/bin/bash

# Define the file names
envFile=$1
templateFile=$2
bitwardenLink=""

# Function to echo error messages in red
echoError() {
    # $1 is the first argument to the function: the error message to echo in red
    echo -e "\033[31m ERROR: $1\033[0m"
}

# Check if both files exist
if [ ! -f "$envFile" ]; then
    echoError "No .env file found. Get the latest .env in $bitwardenLink"
    exit 1
fi

# Initialize a flag to indicate a mismatch
mismatchFound=0

# Read each line from .env.template
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    
    # Extract the key name (assuming the format KEY=value)
    key="${line%%=*}"
    
    # Check if the key exists in .env
    if ! grep -q "^$key=" "$envFile"; then
        echo "Missing $key in $envFile"
        mismatchFound=1
    fi
done < "$templateFile"

# Check the mismatch flag to determine the script exit status
if [ $mismatchFound -ne 0 ]; then
    echoError "Mismatch found. Get the latest .env in $bitwardenLink"
    exit 1
else
    echo "All keys from .env.template are present in .env."
fi
