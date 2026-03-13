#!/bin/bash

echo "🔍 KASHTEC Railway Diagnostic Tool"
echo "=================================="

# Get Railway URL from user
echo "Please provide your Railway URL:"
echo "Example: https://your-app-name.railway.app"
read -p "Railway URL: " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ No URL provided. Using placeholder..."
    RAILWAY_URL="https://your-app-name.railway.app"
fi

echo ""
echo "📍 Testing Railway deployment at: $RAILWAY_URL"
echo ""

# Test 1: Basic connectivity
echo "🔍 Test 1: Basic Connectivity"
echo "Testing if the server is responding..."

if command -v curl &> /dev/null; then
    # Use curl if available
    response=$(curl -s -w "%{http_code}" "$RAILWAY_URL" -o /tmp/response.html)
    http_code="${response: -3}"
    
    echo "HTTP Status Code: $http_code"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Server is responding"
        echo "📄 Response size: $(wc -c < /tmp/response.html) bytes"
    elif [ "$http_code" = "502" ]; then
        echo "❌ Bad Gateway Error (502)"
        echo "🔧 Server might not be ready or not binding correctly"
    elif [ "$http_code" = "404" ]; then
        echo "❌ Not Found (404)"
        echo "🔧 Server is running but route not found"
    else
        echo "⚠️  Unexpected HTTP code: $http_code"
    fi
else
    echo "❌ curl not available, cannot test connectivity"
fi

echo ""

# Test 2: Health Check
echo "🔍 Test 2: Health Check Endpoint"
echo "Testing /api/health endpoint..."

if command -v curl &> /dev/null; then
    response=$(curl -s -w "%{http_code}" "$RAILWAY_URL/api/health" -o /tmp/health.json)
    http_code="${response: -3}"
    
    echo "Health Check HTTP Status: $http_code"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Health check passed"
        echo "📊 Response:"
        cat /tmp/health.json | head -3
    else
        echo "❌ Health check failed"
        echo "🔧 API endpoints might not be working"
    fi
fi

echo ""

# Test 3: Root Health Check
echo "🔍 Test 3: Root Health Check"
echo "Testing /health endpoint..."

if command -v curl &> /dev/null; then
    response=$(curl -s -w "%{http_code}" "$RAILWAY_URL/health" -o /tmp/root_health.json)
    http_code="${response: -3}"
    
    echo "Root Health HTTP Status: $http_code"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Root health check passed"
    else
        echo "❌ Root health check failed"
    fi
fi

echo ""
echo "🎯 Diagnostic Summary"
echo "===================="
echo ""
echo "📝 Manual Testing Steps:"
echo "1. Open $RAILWAY_URL in your browser"
echo "2. If you see 'Bad Gateway', wait 2-3 minutes and try again"
echo "3. Try the health check: $RAILWAY_URL/api/health"
echo "4. Try login with: admin@kashtec.co.tz / admin123"
echo ""
echo "🔧 Common Issues & Solutions:"
echo "- Bad Gateway (502): Server starting up, wait longer"
echo "- Not Found (404): Server running but routing issue"
echo "- Connection refused: Server not binding to correct port"
echo "- Timeout: Firewall or network issue"
echo ""
echo "📊 Check Railway Dashboard:"
echo "1. Go to railway.app"
echo "2. Click your project"
echo "3. Check deployment logs for errors"
echo "4. Verify service is running (green status)"
echo "5. Check environment variables"
echo ""
echo "🚀 If all tests pass but still can't access:"
echo "- Clear browser cache"
echo "- Try incognito/private window"
echo "- Check if URL is correct"
echo "- Contact Railway support if issue persists"

# Cleanup
rm -f /tmp/response.html /tmp/health.json /tmp/root_health.json
