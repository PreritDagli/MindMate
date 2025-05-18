#!/bin/bash
# MindMate Runner Script
# This script helps run both the main application and keep-alive service

echo "=== Starting MindMate Services ==="
echo "1. Starting Keep-Alive Service..."
node keep_alive.mjs &
KEEP_ALIVE_PID=$!
echo "Keep-Alive Service started with PID: $KEEP_ALIVE_PID"

echo "2. Starting Main Application..."
npm run dev &
APP_PID=$!
echo "Main Application started with PID: $APP_PID"

echo ""
echo "=== MindMate is now running ==="
echo "Main Application URL: https://$(hostname)/"
echo "Keep-Alive Service Status: https://$(hostname):3001/"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and clean up
trap "echo 'Stopping services...'; kill $KEEP_ALIVE_PID $APP_PID; exit" INT

# Wait for both processes
wait $KEEP_ALIVE_PID $APP_PID