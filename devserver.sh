#!/bin/bash

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=5001
fi

echo "Starting development server on port $PORT..."
echo "Open http://localhost:$PORT in your browser"

# Run Flask development server
python -m flask --app main run --host=0.0.0.0 --port=$PORT --debug
