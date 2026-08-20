# Deployment Tools Index

## 🚀 Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **DEPLOYMENT-SUMMARY.md** | Start here! Overview & 3-step quick deploy | 2 min |
| **QUICK-START.md** | Complete reference with examples | 5 min |
| **DEPLOYMENT.md** | In-depth guide with all options | 10 min |

## 📋 Scripts

| Script | Purpose | Run On |
|--------|---------|--------|
| `check-deploy.sh` | Pre-flight system check | Dev machine |
| `deploy.sh` | One-command production deploy | Dev machine |
| `setup-server.sh` | Standalone setup script | Remote server |

---

## 🎯 Start Here (3 Steps)

### Step 1: Verify System Ready
```bash
chmod +x check-deploy.sh
./check-deploy.sh
```

### Step 2: Deploy to Server
```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Access Application
```
http://192.168.1.100:3002
```

---

## 📚 Documentation Guides

### For First-Time Deployment
Read in order:
1. `DEPLOYMENT-SUMMARY.md` - Overview
2. `QUICK-START.md` - Step-by-step instructions
3. Run `./check-deploy.sh` to verify prerequisites
4. Run `./deploy.sh` to deploy

### For Troubleshooting
- `QUICK-START.md` → "Troubleshooting" section
- Check logs: `ssh [IP of your server] 'sudo journalctl -u nginx -f'`

### For System Administration
- `DEPLOYMENT.md` → "Nginx Service Management"
- `DEPLOYMENT.md` → "Performance Optimization"
- `DEPLOYMENT.md` → "Backup and Recovery"

### For Updates
- `QUICK-START.md` → "Updating the Application"

---

## 🔧 Script Details

### check-deploy.sh
**Pre-deployment verification script**
- Verifies: Node.js, npm, rsync, SSH
- Tests: SSH connection to Server
- Checks: Project files and build status
- Shows: Helpful error messages if issues found

Usage:
```bash
./check-deploy.sh
```

Output: ✓ All checks passed! or ✗ Some checks failed

### deploy.sh
**Automated one-command deployment**

What it does:
1. Builds Vite application with `npm run build`
2. Creates minimal deployment package
3. Transfers to Server via rsync
4. Configures Nginx service
5. Verifies application is running

Configuration (edit if needed):
```bash
SERVER_USER="[USERNAME]"                                 # SSH user
SERVER_HOST="[IP of your server]"                       # Server IP
SERVER_PATH="/home/[USERNAME]/gshock-smart-sync"         # App directory
APP_PORT="3000"                                        # Application port
```

Usage:
```bash
./deploy.sh
```

Time to complete: ~3-5 minutes

### setup-server.sh
**Standalone setup script for remote server**

What it does:
1. Installs Nginx if needed
2. Creates Nginx configuration
3. Restarts Nginx

Usage (on Server):
```bash
cd /home/[USERNAME]/gshock-smart-sync
./setup-server.sh
```

Or remotely:
```bash
ssh [USERNAME]@[IP of your server] '/home/[USERNAME]/gshock-smart-sync/setup-server.sh'
```

---

## 📖 Documentation Details

### DEPLOYMENT-SUMMARY.md
Quick overview covering:
- What you have (features)
- 3-step quick deployment
- What the deploy script does
- After deployment (access & monitoring)
- Troubleshooting quick links
- File structure overview

**Best for:** First-time users, quick reference

### QUICK-START.md
Comprehensive reference covering:
- Deployment overview & methods
- Automated deployment steps
- Manual deployment alternative
- Nginx service management
- Troubleshooting guide with solutions
- Performance optimization
- Backup and recovery
- File locations
- Uninstall procedures

**Best for:** Step-by-step guidance, troubleshooting

### DEPLOYMENT.md
In-depth technical guide covering:
- Full prerequisites checklist
- Complete deployment workflow
- Nginx service administration
- File location reference
- Production optimization
- Advanced troubleshooting
- Updating procedures
- Backup/recovery procedures

**Best for:** System administrators, detailed reference

---

## 🚦 Status Indicators

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ All checks passed | Ready to deploy | Run `./deploy.sh` |
| ⚠️ Some warnings | Non-critical issues | Review warnings section |
| ❌ Failed checks | Cannot deploy | Fix issues before running deploy |

---

## 🆘 Troubleshooting Quick Links

**Problem:** Cannot connect to http://192.168.1.100:3002
- See: `QUICK-START.md` → "Troubleshooting"

**Problem:** Service won't start
- Check logs: `ssh [USERNAME]@[IP of your server] 'sudo journalctl -u nginx -n 100'`
- See: `DEPLOYMENT.md` → "Troubleshooting"

**Problem:** Out of memory
- See: `QUICK-START.md` → "Out of Memory Errors"

**Problem:** SSH connection fails
- See: `QUICK-START.md` → "SSH Connection Issues"

**Problem:** Need to update the app
- See: `QUICK-START.md` → "Updating the Application"

---

## 🔐 Security Notes

- Ensure SSH key is set up for passwordless login (recommended)
- The application is served by Nginx
- Files are owned by user `USERNAME`
- Consider using Nginx with SSL for production (see DEPLOYMENT.md)

---

## 📊 System Requirements

**Development Machine:**
- Node.js 18+ (or 14+ if using older npm)
- npm 8+
- rsync
- SSH client
- 500 MB disk space for build

**Server:**
- Linux OS (Ubuntu, Debian, etc.)
- SSH enabled
- 1 GB RAM minimum
- 500 MB available disk space
- Internet connectivity

**Network:**
- Both devices on same network
- Server accessible at 192.168.1.100 (configurable)

---

## 📱 Supported Devices

The application supports 19 G-Shock watch models with comprehensive capability detection:
- GA series (classic, basic)
- GW series (radio-controlled, solar)
- DW series (digital)
- GMW series (module)
- And 14 additional models

Each watch has 24 capability flags for intelligent feature adaptation.

---

## 🔄 Update Cycle

1. **Development** - Make code changes
2. **Testing** - Test locally with `npm run dev`
3. **Build** - Create production build with `npm run build`
4. **Deploy** - Run `./deploy.sh`
5. **Verify** - Access http://192.168.1.100:3002

For quick updates (code only, no build changes):
```bash
rsync -avz dist/* [USERNAME]@[IP of your server]:/home/[USERNAME]/gshock-smart-sync/
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart nginx'
```

---

## 📞 Support

1. Check relevant documentation section
2. Review logs: `ssh [USERNAME]@[IP of your server] 'sudo journalctl -u nginx -f'`
3. Run `./check-deploy.sh` to verify prerequisites
4. Verify network connectivity: `ping [IP of your server]`

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Node.js 18+ installed on dev machine
- [ ] rsync installed on dev machine
- [ ] SSH client installed and accessible
- [ ] Can SSH to [USERNAME]@[IP of your server]
- [ ] Server has internet connectivity
- [ ] At least 500 MB free disk space on server

Ready? Run:
```bash
./check-deploy.sh    # Verify everything
./deploy.sh          # Deploy
```

---

## 🎉 Success Criteria

After deployment, you should be able to:
- ✅ Access http://[IP of your server]:3002 in browser
- ✅ Connect G-Shock watch via Bluetooth
- ✅ View watch time and battery status
- ✅ Manage alarms (up to 5)
- ✅ Manage events/reminders (up to 5)
- ✅ Sync time to watch
- ✅ Receive user feedback (Snackbar) on all operations
- ✅ Nginx starts on server reboot

---

*Deployment Infrastructure Ready* ✓
