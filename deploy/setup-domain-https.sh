#!/bin/bash

# Setup script for mysimsar.ae domain with HTTPS
# Run this on your server as root or with sudo

set -e

DOMAIN="mysimsar.ae"
APP_DIR="/var/www/mysimsar"
BACKEND_PORT=4000
FRONTEND_PORT=3000

echo "=========================================="
echo "Setting up domain: $DOMAIN with HTTPS"
echo "=========================================="

# 1. Install Certbot for Let's Encrypt SSL
echo ""
echo "Step 1: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "Certbot already installed"
fi

# 2. Update Nginx configuration
echo ""
echo "Step 2: Updating Nginx configuration..."
cat > /etc/nginx/sites-available/mysimsar << 'EOF'
# HTTP server - redirects to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name mysimsar.ae www.mysimsar.ae;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mysimsar.ae www.mysimsar.ae;

    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/mysimsar.ae/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mysimsar.ae/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi
ln -sf /etc/nginx/sites-available/mysimsar /etc/nginx/sites-enabled/mysimsar

# Test Nginx config
echo ""
echo "Step 3: Testing Nginx configuration..."
nginx -t

# 3. Get SSL certificate
echo ""
echo "Step 4: Obtaining SSL certificate from Let's Encrypt..."
echo "Make sure your domain DNS points to this server's IP address!"
read -p "Press Enter to continue after verifying DNS..."

certbot --nginx -d mysimsar.ae -d www.mysimsar.ae --non-interactive --agree-tos --email admin@mysimsar.ae --redirect

# 4. Update environment variables
echo ""
echo "Step 5: Updating environment variables..."

# Backend .env
if [ -f "$APP_DIR/backend/.env" ]; then
    # Update or add NODE_ENV if needed
    if ! grep -q "^NODE_ENV=" "$APP_DIR/backend/.env"; then
        echo "NODE_ENV=production" >> "$APP_DIR/backend/.env"
    fi
    echo "Backend .env updated"
else
    echo "Warning: Backend .env not found at $APP_DIR/backend/.env"
fi

# Frontend .env
cat > "$APP_DIR/frontend/.env" << EOF
NEXT_PUBLIC_API_URL=https://mysimsar.ae/api
NEXT_PUBLIC_SITE_URL=https://mysimsar.ae
EOF
echo "Frontend .env created/updated"

# 5. Rebuild frontend with new URLs
echo ""
echo "Step 6: Rebuilding frontend with new domain..."
cd "$APP_DIR/frontend"
npm run build

# 6. Restart services
echo ""
echo "Step 7: Restarting services..."
pm2 restart all
systemctl reload nginx

# 7. Set up auto-renewal
echo ""
echo "Step 8: Setting up SSL certificate auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo "Domain: https://mysimsar.ae"
echo "API: https://mysimsar.ae/api"
echo ""
echo "Next steps:"
echo "1. Verify the site is accessible at https://mysimsar.ae"
echo "2. Check PM2 status: pm2 status"
echo "3. Check Nginx status: systemctl status nginx"
echo "4. View logs: pm2 logs"
echo ""

