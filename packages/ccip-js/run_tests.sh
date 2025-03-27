#!/bin/bash

# Start anvil in the background
anvil --block-time 5 &
ANVIL_PID=$!

# Wait for anvil to start
sleep 5

# Run tests
pnpm test

# Kill anvil process after tests
kill $ANVIL_PID
