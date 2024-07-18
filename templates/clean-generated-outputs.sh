#!/bin/bash

# Clean generated outputs
echo "Cleaning generated outputs..."


root_node_modules_path="node_modules"
app_rn_name="mobile"
app_rn_android_path="apps/$app_rn_name/android"
app_rn_android_gradle_path="$app_rn_android_path/.gradle"
app_rn_node_modules_path="apps/$app_rn_name/node_modules"
app_rn_ios_pods_path="apps/$app_rn_name/ios/Pods"
app_rn_ios_build_path="apps/$app_rn_name/ios/build"

echo "Deleting root $root_node_modules_path..."
rm -rf "$root_node_modules_path"

echo "Deleting $app_rn_node_modules_path..."
rm -rf "$app_rn_node_modules_path"

echo "Deleting $app_rn_ios_pods_path..."
rm -rf "$app_rn_ios_pods_path"

echo "Deleting $app_rn_ios_build_path..."
rm -rf "$app_rn_ios_build_path"

echo "Deleting $app_rn_android_gradle_path..."
rm -rf "$app_rn_android_gradle_path"

npm install

echo "Done!"