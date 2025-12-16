#!/bin/bash
# Quick commands to set up mysimsar.ae domain with HTTPS
# Run these commands on your server

# ============================================
# STEP 1: Install Certbot
# ============================================
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# ============================================
# STEP 2: Create Nginx Config
# ============================================
sudo tee /etc/nginx/sites-available/mysimsar > /dev/null << 'EOF'
# HTTP server - redirects to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name mysimsar.ae www.mysimsar.ae;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mysimsar.ae www.mysimsar.ae;

    ssl_certificate /etc/letsencrypt/live/mysimsar.ae/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mysimsar.ae/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 20M;
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

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

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/mysimsar /etc/nginx/sites-enabled/mysimsar
sudo nginx -t

# ============================================
# STEP 3: Get SSL Certificate
# ============================================
# IMPORTANT: Replace admin@mysimsar.ae with your email
sudo certbot --nginx -d mysimsar.ae -d www.mysimsar.ae --non-interactive --agree-tos --email admin@mysimsar.ae --redirect

# ============================================
# STEP 4: Update Environment Variables
# ============================================

# Update Frontend .env
cd /var/www/mysimsar/frontend
cat > .env << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://mysimsar.ae/api
NEXT_PUBLIC_SITE_URL=https://mysimsar.ae
ENVEOF

# Update Backend .env (if needed)
cd /var/www/mysimsar/backend
if ! grep -q "^NODE_ENV=" .env 2>/dev/null; then
    echo "NODE_ENV=production" >> .env
fi

# ============================================
# STEP 5: Rebuild Frontend
# ============================================
cd /var/www/mysimsar/frontend
npm run build

# ============================================
# STEP 6: Restart Services
# ============================================
pm2 restart all
sudo systemctl reload nginx

# ============================================
# STEP 7: Enable Auto-Renewal
# ============================================
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo ""
echo "✅ Setup complete!"
echo "🌐 Visit: https://mysimsar.ae"
echo "🔍 Check status: pm2 status && sudo systemctl status nginx"

