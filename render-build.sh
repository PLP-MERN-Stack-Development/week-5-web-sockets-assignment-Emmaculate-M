#!/usr/bin/env bash

# render-build.sh

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Add pnpm to PATH
export PATH="$HOME/.local/share/pnpm:$PATH"

# Install dependencies and skip optional peer warnings
cd server
pnpm install

# (Optional) Run build if you ever add a build script
pnpm run build || echo "No build step defined, continuing..."

# Start the server
pnpm start
