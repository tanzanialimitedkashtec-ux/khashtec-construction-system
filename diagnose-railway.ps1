# KASHTEC Railway Diagnostic Tool
Write-Host "🔍 KASHTEC Railway Diagnostic Tool" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# Get Railway URL from user
$RAILWAY_URL = Read-Host "Please provide your Railway URL (Example: https://your-app-name.railway.app)"

if ([string]::IsNullOrEmpty($RAILWAY_URL)) {
    Write-Host "❌ No URL provided. Using placeholder..." -ForegroundColor Red
    $RAILWAY_URL = "https://your-app-name.railway.app"
}

Write-Host ""
Write-Host "📍 Testing Railway deployment at: $RAILWAY_URL" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic connectivity
Write-Host "🔍 Test 1: Basic Connectivity" -ForegroundColor Yellow
Write-Host "Testing if the server is responding..."

try {
    $response = Invoke-WebRequest -Uri "$RAILWAY_URL" -Method Get -TimeoutSec 10
    Write-Host "✅ Server is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "📄 Response size: $($response.Content.Length) bytes" -ForegroundColor White
} catch {
    if ($_.Exception.Response -eq $null) {
        Write-Host "❌ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔧 Server might not be running or network issue" -ForegroundColor Yellow
    } else {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "❌ HTTP Error: $statusCode" -ForegroundColor Red
        
        switch ($statusCode) {
            502 { Write-Host "🔧 Bad Gateway - Server might not be ready" -ForegroundColor Yellow }
            404 { Write-Host "🔧 Not Found - Server running but route issue" -ForegroundColor Yellow }
            default { Write-Host "🔧 Unexpected error - Check logs" -ForegroundColor Yellow }
        }
    }
}

Write-Host ""

# Test 2: Health Check
Write-Host "🔍 Test 2: Health Check Endpoint" -ForegroundColor Yellow
Write-Host "Testing /api/health endpoint..."

try {
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "📊 Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 API endpoints might not be working" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Root Health Check
Write-Host "🔍 Test 3: Root Health Check" -ForegroundColor Yellow
Write-Host "Testing /health endpoint..."

try {
    $response = Invoke-RestMethod -Uri "$RAILWAY_URL/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Root health check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Root health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Diagnostic Summary" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Open $RAILWAY_URL in your browser" -ForegroundColor White
Write-Host "2. If you see 'Bad Gateway', wait 2-3 minutes and try again" -ForegroundColor White
Write-Host "3. Try the health check: $RAILWAY_URL/api/health" -ForegroundColor White
Write-Host "4. Try login with: admin@kashtec.co.tz / admin123" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Common Issues & Solutions:" -ForegroundColor Cyan
Write-Host "- Bad Gateway (502): Server starting up, wait longer" -ForegroundColor White
Write-Host "- Not Found (404): Server running but routing issue" -ForegroundColor White
Write-Host "- Connection refused: Server not binding to correct port" -ForegroundColor White
Write-Host "- Timeout: Firewall or network issue" -ForegroundColor White
Write-Host ""

Write-Host "📊 Check Railway Dashboard:" -ForegroundColor Cyan
Write-Host "1. Go to railway.app" -ForegroundColor White
Write-Host "2. Click your project" -ForegroundColor White
Write-Host "3. Check deployment logs for errors" -ForegroundColor White
Write-Host "4. Verify service is running (green status)" -ForegroundColor White
Write-Host "5. Check environment variables" -ForegroundColor White
Write-Host ""

Write-Host "🚀 If all tests pass but still can't access:" -ForegroundColor Cyan
Write-Host "- Clear browser cache" -ForegroundColor White
Write-Host "- Try incognito/private window" -ForegroundColor White
Write-Host "- Check if URL is correct" -ForegroundColor White
Write-Host "- Contact Railway support if issue persists" -ForegroundColor White
