# POS Awesome Installation Guide

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04/22.04, Debian 11, CentOS 8, macOS
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher  
- **MariaDB**: 10.3 or higher
- **Redis**: 5.0 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 20GB free space

### Software Requirements
- ERPNext Version 15 installed and running
- Frappe Framework Version 15
- Git for version control
- wkhtmltopdf for PDF generation

## Installation Methods

## Method 1: Frappe Cloud (Recommended for Production)

### One-Click Installation
1. Visit [Frappe Cloud Marketplace](https://frappecloud.com/marketplace/apps/posawesome)
2. Click "Install" on POS Awesome app
3. Select your site
4. Follow the installation wizard

## Method 2: Manual Installation (Self-Hosted)

### Step 1: Prepare Environment

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system dependencies
sudo apt install python3-pip python3-dev python3-venv \
    mariadb-server mariadb-client \
    redis-server \
    nodejs npm \
    git nginx supervisor \
    wkhtmltopdf -y

# Install yarn (optional but recommended)
sudo npm install -g yarn
```

### Step 2: Install Frappe Bench

```bash
# Install bench CLI
pip3 install frappe-bench

# Create a new bench
bench init frappe-bench --frappe-branch version-15

# Navigate to bench directory
cd frappe-bench
```

### Step 3: Install ERPNext

```bash
# Get ERPNext app
bench get-app erpnext --branch version-15

# Create new site
bench new-site your-site.local

# Install ERPNext on site
bench --site your-site.local install-app erpnext
```

### Step 4: Install POS Awesome

```bash
# Get POS Awesome app
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git

# Install Python dependencies
bench setup requirements

# Build frontend assets
bench build --app posawesome

# Install app on site
bench --site your-site.local install-app posawesome

# Run migrations
bench --site your-site.local migrate

# Clear cache
bench --site your-site.local clear-cache

# Restart bench
bench restart
```

## Method 3: Docker Installation

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3'

services:
  backend:
    image: frappe/erpnext:v15.latest
    deploy:
      restart_policy:
        condition: on-failure
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    environment:
      - SITE_NAME=your-site.local
      - DB_HOST=mariadb
      - REDIS_CACHE=redis-cache:6379
      - REDIS_QUEUE=redis-queue:6379
      - REDIS_SOCKETIO=redis-socketio:6379
    depends_on:
      - mariadb
      - redis-cache
      - redis-queue
      - redis-socketio

  mariadb:
    image: mariadb:10.6
    deploy:
      restart_policy:
        condition: on-failure
    environment:
      - MYSQL_ROOT_PASSWORD=changeme
    volumes:
      - mariadb-data:/var/lib/mysql

  redis-cache:
    image: redis:alpine
    deploy:
      restart_policy:
        condition: on-failure

  redis-queue:
    image: redis:alpine
    deploy:
      restart_policy:
        condition: on-failure

  redis-socketio:
    image: redis:alpine
    deploy:
      restart_policy:
        condition: on-failure

volumes:
  mariadb-data:
  sites:
  logs:
```

### Install with Docker

```bash
# Start containers
docker-compose up -d

# Enter container
docker exec -it frappe-bench_backend_1 bash

# Inside container, install POS Awesome
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git
bench --site your-site.local install-app posawesome
bench --site your-site.local migrate
```

## Post-Installation Setup

### Step 1: Initial Configuration

```bash
# Set administrator password
bench --site your-site.local set-admin-password

# Enable developer mode (optional, for customization)
bench --site your-site.local set-config developer_mode 1

# Enable production mode (for production deployment)
sudo bench setup production [frappe-user]
```

### Step 2: Configure POS Profile

1. Login to ERPNext as Administrator
2. Navigate to **Retail > Settings > POS Profile**
3. Create new POS Profile:
   - Profile Name: "Main POS"
   - Company: Select your company
   - Warehouse: Select main warehouse
   - Price List: Standard Selling
4. Enable POS Awesome settings in the profile
5. Save the POS Profile

### Step 3: Set User Permissions

1. Go to **User** list
2. Select POS user
3. Add roles:
   - POS User
   - Sales User
   - Item Manager (optional)
   - Customer Manager (optional)
4. Set POS Profile in user permissions

### Step 4: Configure Payment Methods

1. Navigate to **Accounting > Payment Method**
2. Create/verify payment methods:
   - Cash
   - Credit Card
   - Bank Transfer
   - Mobile Payment (if applicable)
3. Link payment methods to appropriate accounts

### Step 5: Basic Data Setup

```bash
# Import sample data (optional)
bench --site your-site.local import-csv [path-to-csv]

# Or manually create:
# 1. Item Groups (categories)
# 2. Items with prices
# 3. Customers
# 4. Tax templates
```

## Verification

### Test Installation

```bash
# Check if app is installed
bench --site your-site.local list-apps

# Expected output should include:
# frappe
# erpnext
# posawesome
```

### Access POS Interface

1. Login to ERPNext
2. Navigate to **Retail > Point of Sale > POS Awesome**
3. Select POS Profile
4. Open new shift
5. Verify interface loads correctly

### Run Diagnostics

```bash
# Check for any issues
bench --site your-site.local doctor

# Run migrations again if needed
bench --site your-site.local migrate

# Clear cache if having issues
bench --site your-site.local clear-cache
```

## Troubleshooting

### Common Installation Issues

#### Issue 1: Module Import Error
```bash
# Error: No module named 'posawesome'
# Solution:
bench build --app posawesome
bench restart
```

#### Issue 2: Assets Not Loading
```bash
# Solution: Rebuild assets
bench build --app posawesome --force
bench clear-cache
```

#### Issue 3: Permission Denied
```bash
# Solution: Fix permissions
sudo chown -R frappe:frappe /home/frappe/frappe-bench
bench setup requirements
```

#### Issue 4: Database Migration Failed
```bash
# Solution: Run migrations manually
bench --site your-site.local migrate
bench --site your-site.local clear-cache
```

#### Issue 5: Redis Connection Error
```bash
# Solution: Check Redis services
sudo service redis-server status
sudo service redis-server restart
bench restart
```

### Advanced Troubleshooting

#### Enable Debug Mode
```bash
bench --site your-site.local set-config developer_mode 1
bench --site your-site.local set-config logging 2
```

#### Check Logs
```bash
# Check error logs
tail -f logs/error.log

# Check worker logs
tail -f logs/worker.log

# Check web logs
tail -f logs/web.log
```

#### Database Issues
```bash
# Access MariaDB
bench --site your-site.local mariadb

# Check tables
SHOW TABLES LIKE '%pos%';

# Verify custom fields
SELECT * FROM `tabCustom Field` WHERE dt = 'Sales Invoice';
```

## Updating POS Awesome

### Update Process

```bash
# Navigate to bench directory
cd frappe-bench

# Pull latest changes
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git --overwrite

# Update dependencies
bench setup requirements

# Build assets
bench build --app posawesome

# Run migrations
bench --site your-site.local migrate

# Clear cache
bench clear-cache

# Restart services
bench restart
```

### Backup Before Update

```bash
# Create backup
bench --site your-site.local backup

# Backup location
ls sites/your-site.local/private/backups/
```

## Uninstallation

### Remove POS Awesome

```bash
# Uninstall from site
bench --site your-site.local uninstall-app posawesome

# Remove app from bench (optional)
bench remove-app posawesome

# Clear cache
bench clear-cache

# Restart
bench restart
```

## Production Deployment

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Supervisor Configuration

```bash
# Generate supervisor config
bench setup supervisor

# Reload supervisor
sudo supervisorctl reload

# Check status
sudo supervisorctl status
```

### Performance Tuning

```bash
# Increase worker processes
bench config workers 4

# Configure Redis memory
echo "maxmemory 1gb" | sudo tee -a /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" | sudo tee -a /etc/redis/redis.conf

# Restart Redis
sudo service redis-server restart
```

## Support and Resources

### Getting Help
- [GitHub Issues](https://github.com/yrestom/POS-Awesome/issues)
- [Wiki Documentation](https://github.com/yrestom/POS-Awesome/wiki)
- [Frappe Forum](https://discuss.frappe.io)
- Email: info@totrox.com

### Useful Commands
```bash
# Check bench status
bench doctor

# View running processes
bench status

# Update all apps
bench update

# Backup site
bench --site your-site.local backup

# Restore site
bench --site your-site.local restore [path-to-backup]
```