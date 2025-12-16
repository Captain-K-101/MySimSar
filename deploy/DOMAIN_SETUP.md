# Domain Setup Guide for mysimsar.ae

## Prerequisites
1. Domain `mysimsar.ae` DNS A record pointing to your server IP
2. SSH access to your server
3. Root or sudo access

## Quick Setup (Automated)

Run the automated script:
```bash
cd /var/www/mysimsar
git pull origin main
chmod +x deploy/setup-domain-https.sh
sudo bash deploy/setup-domain-https.sh
```

## Manual Setup (Step by Step)

### Step 1: Point DNS to Server
Update your domain's DNS records:
- **A Record**: `mysimsar.ae` → Your server IP
- **A Record**: `www.mysimsar.ae` → Your server IP (optional)

Wait for DNS propagation (can take a few minutes to hours).

### Step 2: Install Certbot
```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Step 3: Update Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/mysimsar
```

Paste this configuration:
```nginx
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
```

Enable the site:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/mysimsar /etc/nginx/sites-enabled/mysimsar
sudo nginx -t
```

### Step 4: Get SSL Certificate
```bash
sudo certbot --nginx -d mysimsar.ae -d www.mysimsar.ae --non-interactive --agree-tos --email admin@mysimsar.ae --redirect
```

**Note**: Replace `admin@mysimsar.ae` with your actual email address.

### Step 5: Update Environment Variables

**Backend** (`/var/www/mysimsar/backend/.env`):
```bash
cd /var/www/mysimsar/backend
nano .env
```

Ensure these are set:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

**Frontend** (`/var/www/mysimsar/frontend/.env`):
```bash
cd /var/www/mysimsar/frontend
nano .env
```

Set these values:
```env
NEXT_PUBLIC_API_URL=https://mysimsar.ae/api
NEXT_PUBLIC_SITE_URL=https://mysimsar.ae
```

### Step 6: Rebuild Frontend
```bash
cd /var/www/mysimsar/frontend
npm run build
```

### Step 7: Restart Services
```bash
pm2 restart all
sudo systemctl reload nginx
```

### Step 8: Set Up Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Verify Setup

1. **Check HTTPS**: Visit `https://mysimsar.ae` in your browser
2. **Check API**: Visit `https://mysimsar.ae/api/health` (if you have a health endpoint)
3. **Check PM2**: `pm2 status`
4. **Check Nginx**: `sudo systemctl status nginx`
5. **Check SSL**: `sudo certbot certificates`

## Troubleshooting

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually (if needed)
sudo certbot renew

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Domain Not Resolving
```bash
# Check DNS
dig mysimsar.ae
nslookup mysimsar.ae

# Check if domain points to your server IP
curl -I http://mysimsar.ae
```

### Application Not Loading
```bash
# Check PM2 logs
pm2 logs

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(3000|4000)'

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

## Maintenance

### Renew SSL Certificate (Automatic)
Certbot automatically renews certificates. To test renewal:
```bash
sudo certbot renew --dry-run
```

### Update Application
```bash
cd /var/www/mysimsar
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

## Security Notes

- SSL certificates auto-renew every 90 days
- Security headers are configured in Nginx
- HTTPS redirect is enforced
- Keep PM2 and Nginx updated regularly

