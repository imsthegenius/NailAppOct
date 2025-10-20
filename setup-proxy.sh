#!/bin/bash

echo "╔════════════════════════════════════════════════════╗"
echo "║     Setting up Supabase Proxy Server               ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Install proxy dependencies
echo "📦 Installing proxy dependencies..."
npm install express@4.18.2 axios@1.6.5 body-parser@1.20.2 cors@2.8.5

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📍 Your local IP address is: $LOCAL_IP"
echo ""
echo "For physical device testing, update your app with this IP:"
echo "  lib/supabaseProxy.ts line 20:"
echo "  const localIP = '$LOCAL_IP';"
echo ""
echo "🚀 Starting proxy server..."
echo ""

# Start the proxy server
node supabase-proxy-server.js