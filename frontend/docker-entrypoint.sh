#!/bin/sh

# This script runs when the container starts
# It generates env.js from env.template.js using environment variables

# Default values if not set
API_URL=${API_URL:-http://localhost:3000}
WS_URL=${WS_URL:-ws://localhost:3000}

echo "Generating env.js with API_URL=$API_URL and WS_URL=$WS_URL"

# Use sed to replace placeholders in env.template.js and output to env.js
# We use | as delimiter for sed to avoid issues with / in URLs
sed "s|\${API_URL}|$API_URL|g; s|\${WS_URL}|$WS_URL|g" /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start nginx
exec nginx -g 'daemon off;'
