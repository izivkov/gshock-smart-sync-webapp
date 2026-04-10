# G-Shock Smart Sync - Raspberry Pi Production Deployment

This guide explains how to deploy the G-Shock Smart Sync web application to a Raspberry Pi in production.

## Prerequisites

### On your development machine:
- Node.js 18+ and npm
- SSH access configured to the Raspberry Pi
- `rsync` installed (for file transfer)
- Git (to clone the repository)

### On the Raspberry Pi:
- Raspberry Pi OS (Bullseye or newer)
- SSH enabled
- Node.js 18+ installed
- Internet connection

## Quick Start

### 1. Prepare Raspberry Pi

Connect to your Raspberry Pi and run initial setup:

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
chmod +x deploy-rpi.sh

# Run the deployment script
./deploy-rpi.sh
```

The script will:
1. Build the Next.js application
2. Create a minimal deployment package
3. Transfer files to the Raspberry Pi via rsync
4. Install dependencies on the RPi
5. Setup systemd service for auto-start
6. Verify the application is running

### 3. Access the application

Once deployed, access the application at:
```
http://192.168.1.100:3000
```

## Systemd Service Management

The deployment script sets up a systemd service called `gshock-webapp` for automatic start and management.

### View logs in real-time:
```bash
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -f'
```

### Stop the application:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl stop gshock-webapp'
```

### Start the application:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl start gshock-webapp'
```

### Restart the application:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart gshock-webapp'
```

### Check service status:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl status gshock-webapp'
```

### Enable/disable auto-start:
```bash
# Enable auto-start on boot
ssh [USERNAME]@[IP of your server] 'sudo systemctl enable gshock-webapp'

# Disable auto-start on boot
ssh [USERNAME]@[IP of your server] 'sudo systemctl disable gshock-webapp'
```

## File Locations on Raspberry Pi

- **Application root**: `/home/[USERNAME]/gshock-smart-sync`
- **Service file**: `/etc/systemd/system/gshock-webapp.service`
- **Logs**: `journalctl -u gshock-webapp`
- **Node modules**: `/home/[USERNAME]/gshock-smart-sync/node_modules`

## Production Optimization

For a Raspberry Pi with limited resources, consider these optimizations:

### 1. Enable swap (if not already done)
```bash
sudo dphys-swapfile swapon
```

### 2. Monitor resource usage
```bash
# Check CPU and memory
htop

# Check disk space
df -h

# Check process memory
ps aux | grep node
```

### 3. Performance tuning
The Node.js process may use significant memory on a Raspberry Pi. You can:
- Use older Raspberry Pi models with larger memory allocations
- Consider using PM2 for better process management (optional)
- Enable gzip compression in Next.js config

### 4. Nginx as reverse proxy (optional)
For better performance and SSL support, setup Nginx:

```bash
sudo apt-get install nginx

# Configure Nginx as reverse proxy to :3000
# Edit /etc/nginx/sites-available/default and add:
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

sudo systemctl restart nginx
```

## Troubleshooting

### Application won't start
```bash
# Check logs
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -n 50'

# Check service status
ssh [USERNAME]@[IP of your server] 'sudo systemctl status gshock-webapp'
```

### Out of memory errors
- Increase swap size
- Monitor with `htop` and check for memory leaks
- Consider stopping other services

### SSH connection refused
- Check if SSH is enabled on RPi: `sudo systemctl status ssh`
- Verify network connectivity: `ping 192.168.1.100`
- Check firewall rules

### Port 3000 already in use
Change the port in the systemd service file:
```bash
ssh [USERNAME]@[IP of your server] 'sudo nano /etc/systemd/system/gshock-webapp.service'
# Change: ExecStart=/usr/bin/npm start -- -p 3001
sudo systemctl restart gshock-webapp
```

## Updating the application

To deploy a new version:

```bash
# On your development machine
git pull origin main
./deploy-rpi.sh
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
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart gshock-webapp'
```

## Support

For issues or questions, check:
- Application logs: `journalctl -u gshock-webapp -f`
- Node.js documentation: https://nodejs.org/
- Next.js documentation: https://nextjs.org/docs
- Raspberry Pi documentation: https://www.raspberrypi.com/documentation/
