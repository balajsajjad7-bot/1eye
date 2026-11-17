#!/usr/bin/env bash
# Builds 1EYE for every platform. Needs Go 1.24+.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
export CGO_ENABLED=0
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w -H windowsgui" -o dist/1EYE.exe .
GOOS=linux   GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/1eye-linux-amd64 .
GOOS=darwin  GOARCH=arm64 go build -trimpath -ldflags "-s -w" -o dist/1eye-macos-arm64 .
# Android server binaries (packed into the APK by ../android/build.sh)
GOOS=android GOARCH=arm64 go build -trimpath -ldflags "-s -w" -o dist/lib1eye-arm64.so .
GOOS=linux   GOARCH=arm64 go build -trimpath -ldflags "-s -w" -o dist/lib1eye-arm64-static.so .
GOOS=linux   GOARCH=arm GOARM=7 go build -trimpath -ldflags "-s -w" -o dist/lib1eye-arm.so .
GOOS=linux   GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/lib1eye-x64.so .
echo "Built into desktop/dist/"
