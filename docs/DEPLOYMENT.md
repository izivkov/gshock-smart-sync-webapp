# G-Shock Smart Sync - Production Deployment

This guide explains how to deploy the G-Shock Smart Sync web application to a remote server in production.

## Prerequisites

### On your development machine:
- Node.js 18+ and npm
- SSH access configured to the remote server (SSH keys recommended)
- `rsync` installed (for file transfer)
- Git (to clone the repository)

### On the Server:
- Linux OS (Ubuntu, Debian, Raspberry Pi OS, etc.)
- SSH enabled
- Node.js 18+ installed
- Internet connection

## Quick Start

### 1. Prepare Server

Connect to your server and run initial setup:

```bash
ssh [USERNAME]@[IP of your server]

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Deploy from development machine

On your local machine, in the project root directory:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
1. Build the Vite application
2. Create a minimal deployment package
3. Transfer files to the server via rsync
4. Install dependencies on the server
5. Setup Nginx site for serving the SPA
6. Verify the application is running

### 3. Access the application

Once deployed, access the application at:
```
http://192.168.1.100:3002
```

## Service Management

The deployment script sets up Nginx for automatic start and management.

### View logs in real-time:
```bash
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u nginx -f'
```

### Stop Nginx:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl stop nginx'
```

### Start Nginx:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl start nginx'
```

### Restart Nginx:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart nginx'
```

### Check service status:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl status nginx'
```

### Enable/disable auto-start:
```bash
# Enable auto-start on boot
ssh [USERNAME]@[IP of your server] 'sudo systemctl enable nginx'

# Disable auto-start on boot
ssh [USERNAME]@[IP of your server] 'sudo systemctl disable nginx'
```

## File Locations on Server

- **Application root**: `/home/[USERNAME]/gshock-smart-sync`
- **Nginx config**: `/etc/nginx/sites-available/gshock-webapp`
- **Logs**: `journalctl -u nginx` or `/var/log/nginx/`
- **Node modules**: `/home/[USERNAME]/gshock-smart-sync/node_modules`

## Production Optimization

For a server with limited resources, consider these optimizations:

### 1. Enable swap (if not already done)
```bash
# For systems using dphys-swapfile
sudo dphys-swapfile swapon
```

### 2. Monitor resource usage
```bash
# Check CPU and memory
htop

# Check disk space
df -h

# Check process memory
ps aux | grep nginx
```

### 3. Performance tuning
The serving process is very efficient as it uses Nginx for static files. You can:
- Enable gzip compression in Nginx config
- Use a CDN like Cloudflare for assets caching

### 4. Advanced Nginx Configuration (optional)
If you need SSL/TLS, modify the Nginx config created by the setup script:

```bash
# Edit /etc/nginx/sites-available/gshock-webapp
# Add your SSL certificates and directives
sudo systemctl restart nginx
```

## Troubleshooting

### Application won't start
```bash
# Check Nginx config syntax
ssh [USERNAME]@[IP of your server] 'sudo nginx -t'

# Check logs
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u nginx -n 50'

# Check service status
ssh [USERNAME]@[IP of your server] 'sudo systemctl status nginx'
```

### Out of memory errors
- Increase swap size
- Monitor with `htop` and check for memory leaks
- Consider stopping other services

### SSH connection refused
- Check if SSH is enabled on server: `sudo systemctl status ssh`
- Verify network connectivity: `ping 192.168.1.100`
- Check firewall rules

### Port 3000 already in use
Change the port in the Nginx configuration file:
```bash
ssh [USERNAME]@[IP of your server] 'sudo nano /etc/nginx/sites-available/gshock-webapp'
# Change: listen 3000;
sudo nginx -t
sudo systemctl restart nginx
```

## Updating the application

To deploy a new version:

```bash
# On your development machine
git pull origin main
./deploy.sh
```

The script will redeploy and restart the service automatically.

## Backup and Recovery

### Create a backup
```bash
ssh [USERNAME]@[IP of your server] 'tar -czf gshock-backup-$(date +%Y%m%d).tar.gz /home/[USERNAME]/gshock-smart-sync'
scp [USERNAME]@[IP of your server]:gshock-backup-*.tar.gz ./backups/
```

### Restore from backup
```bash
scp ./backups/gshock-backup-*.tar.gz [USERNAME]@[IP of your server]:
ssh [USERNAME]@[IP of your server] 'tar -xzf gshock-backup-*.tar.gz -C /'
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart nginx'
```

## Support

For issues or questions, check:
- Application logs: `journalctl -u nginx -f` or `/var/log/nginx/`
- Node.js documentation: https://nodejs.org/
- Vite documentation: https://vitejs.dev/guide/
- Linux distribution documentation
