#!/usr/bin/env bash

# render-build.sh
cd server

# (Optional) Run build if you ever add a build script
pnpm run build || echo "No build step defined"

echo "Build completed"
