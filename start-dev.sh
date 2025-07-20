#!/bin/bash

echo "🚀 Starting DreamSpeak Development Environment..."

# Start backend server
echo "📡 Starting backend server..."
cd ../dream-server
node yogaServer.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../dream-speak
npm run dev -- --host &
FRONTEND_PID=$!

echo "✅ Both servers are starting..."
echo "📱 Access from iPhone: https://192.168.0.65:3000"
echo "💻 Access from Mac: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"

# Wait for user to stop
echo "Press Ctrl+C to stop both servers"
wait 