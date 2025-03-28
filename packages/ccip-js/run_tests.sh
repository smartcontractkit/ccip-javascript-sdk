#!/bin/bash

# Kill any existing anvil processes
pkill -f anvil || true

# Use a fixed port to ensure consistency with test configuration
PORT=8545
echo "Starting anvil on port $PORT"

# Start anvil in the background with the specified port
anvil --port $PORT --block-time 5 &
ANVIL_PID=$!

echo "Anvil started with PID $ANVIL_PID"

# Wait for anvil to start
sleep 5

# Export the anvil port for tests to use
export ANVIL_PORT=$PORT

# Run tests with explicit config flag to avoid the conflict
pnpm jest --config=jest.config.js --coverage

# Make sure to always kill anvil process when script exits
cleanup() {
  echo "Cleaning up anvil process $ANVIL_PID"
  kill $ANVIL_PID 2>/dev/null || true
}

# Set the cleanup to run when script exits
trap cleanup EXIT
