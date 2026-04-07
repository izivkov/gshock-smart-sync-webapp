#!/bin/bash

# G-Shock Smart Sync - Pre-Deployment Checklist
# Run this to verify your system is ready for deployment

echo "=========================================="
echo "Pre-Deployment Checklist"
echo "=========================================="
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ $NODE_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ NOT INSTALLED"
    echo "  Install from: https://nodejs.org/"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ $NPM_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ NOT INSTALLED"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check rsync
echo -n "Checking rsync... "
if command -v rsync &> /dev/null; then
    RSYNC_VERSION=$(rsync --version | head -n 1)
    echo "✓ installed"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ NOT INSTALLED"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  Install: sudo apt-get install rsync"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  Install: brew install rsync"
    fi
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check SSH
echo -n "Checking SSH client... "
if command -v ssh &> /dev/null; then
    echo "✓ installed"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ NOT INSTALLED"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check SSH connectivity to RPi
echo -n "Checking Raspberry Pi connectivity (192.168.1.100)... "
if timeout 3 ssh -o ConnectTimeout=2 ivo@192.168.1.100 "echo 'Connected'" &> /dev/null; then
    echo "✓ SSH accessible"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
    
    # Check Node.js on RPi
    echo -n "Checking Node.js on Raspberry Pi... "
    NODE_VERSION=$(ssh ivo@192.168.1.100 'node --version' 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✓ $NODE_VERSION"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo "✗ NOT INSTALLED on RPi"
        echo "  See QUICK-START.md → 'Prepare Raspberry Pi'"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
else
    echo "✗ NOT ACCESSIBLE"
    echo "  Is Raspberry Pi running at 192.168.1.100?"
    echo "  Can you reach it? Try: ping 192.168.1.100"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check project files
echo -n "Checking deploy-rpi.sh... "
if [ -f "deploy-rpi.sh" ] && [ -x "deploy-rpi.sh" ]; then
    echo "✓ present and executable"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ missing or not executable"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

echo -n "Checking setup-rpi.sh... "
if [ -f "setup-rpi.sh" ] && [ -x "setup-rpi.sh" ]; then
    echo "✓ present and executable"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ missing or not executable"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check Next.js project
echo -n "Checking package.json... "
if [ -f "package.json" ]; then
    echo "✓ present"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "✗ NOT FOUND - Are you in project root?"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check if build exists
echo -n "Checking previous build... "
if [ -d "out" ]; then
    echo "✓ out/ directory exists"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo "⚠ out/ directory not found (will be created during deploy)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""
echo "=========================================="
echo "Summary: $CHECKS_PASSED passed, $CHECKS_FAILED failed"
echo "=========================================="
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "✓ All checks passed! Ready to deploy."
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./deploy-rpi.sh"
    echo "  2. Wait for deployment to complete (~3-5 minutes)"
    echo "  3. Access: http://192.168.1.100:3000"
    echo ""
    exit 0
else
    echo "✗ Some checks failed. Please fix the issues above."
    echo ""
    echo "Common fixes:"
    echo "  • Install Node.js: https://nodejs.org/"
    echo "  • Install rsync: apt-get install rsync (Linux) / brew install rsync (Mac)"
    echo "  • Verify RPi is online: ping 192.168.1.100"
    echo "  • Check SSH setup: ssh ivo@192.168.1.100"
    echo ""
    echo "See QUICK-START.md for more details."
    echo ""
    exit 1
fi
