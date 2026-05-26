#!/bin/bash

# Ensure Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed. Please install it by running:"
    echo "sudo apt-get update && sudo apt-get install -y nginx"
    exit 1
fi

APP_DIR=$(pwd)
CONF_FILE="$APP_DIR/nginx-local.conf"

echo "Creating local Nginx configuration..."
cat > "$CONF_FILE" << EOF
pid /tmp/nginx.pid;
worker_processes 1;
daemon off;
error_log /dev/stderr info;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    access_log /dev/stdout;
    
    server {
        listen 3001;
        server_name localhost;
        root $APP_DIR/dist;
        index index.html;
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF

echo "Starting local Nginx server on port 3001..."
echo "Press Ctrl+C to stop the server."
nginx -c "$CONF_FILE" -p "$APP_DIR"
