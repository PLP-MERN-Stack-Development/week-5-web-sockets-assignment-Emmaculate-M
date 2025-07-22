#!/usr/bin/env bash

# render-build.sh
# Install dependencies and skip optional peer warnings
cd server
pnpm install

# (Optional) Run build if you ever add a build script
pnpm run build || echo "No build step defined, continuing..."

# Start the server
pnpm start
