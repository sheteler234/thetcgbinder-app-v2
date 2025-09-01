# 🚀 Quick Deployment Guide

## How to Deploy Your Changes

### 📋 **Simple 3-Step Process:**

#### 1. **Code Changes → GitHub**
```bash
# After making any code changes:
git add .
git commit -m "Describe what you changed"
git push origin main
```

#### 2. **GitHub → VPS (Full Deployment)**
```bash
# Deploy everything to your VPS:
chmod +x scripts/deployment/deploy-to-vps.sh
./scripts/deployment/deploy-to-vps.sh
```

#### 3. **Quick Updates (if VPS is already set up)**
```bash
# For quick updates without full setup:
chmod +x scripts/deployment/deploy.sh
./scripts/deployment/deploy.sh
```

---

## 📁 **What Files to Use:**

### 🎯 **Main Deployment**
- **File:** `scripts/deployment/deploy-to-vps.sh`
- **Use:** Complete deployment from scratch
- **When:** First time or major changes

### ⚡ **Quick Updates**  
- **File:** `scripts/deployment/deploy.sh`
- **Use:** Quick code updates
- **When:** Small changes, bug fixes

### ⚙️ **VPS Setup**
- **File:** `scripts/deployment/vps-setup.sh`
- **Use:** Initial server setup
- **When:** Setting up new VPS

---

## 🔧 **What Each Script Does:**

### `deploy-to-vps.sh` (Complete Deployment)
1. ✅ Tests SSH connection
2. ✅ Sets up VPS if needed
3. ✅ Clones/updates code from GitHub
4. ✅ Installs dependencies
5. ✅ Builds production app
6. ✅ Configures Nginx
7. ✅ **Fixed:** Better Nginx reload with restart fallback

### `deploy.sh` (Quick Updates)
1. ✅ Pulls latest code
2. ✅ Installs new dependencies
3. ✅ Builds production app
4. ✅ **Fixed:** Smart Nginx reload (checks if root/sudo needed)

---

## 🌐 **Your Live Site:**

- **Current:** http://72.60.80.207
- **Domain:** https://thetcgbinder.com (when DNS pointed)
- **VPS:** 72.60.80.207 (Hostinger)

---

## 🎯 **Quick Commands:**

```bash
# Full deployment:
./scripts/deployment/deploy-to-vps.sh

# Quick update:
./scripts/deployment/deploy.sh

# Check if site is live:
curl -I http://72.60.80.207
```
