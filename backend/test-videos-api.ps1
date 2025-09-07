# Test script for the videos API
Write-Host "Testing Videos API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET
    Write-Host "Health Check: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get All Videos
Write-Host "`n2. Testing Get All Videos..." -ForegroundColor Yellow
try {
    $videosResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos" -Method GET
    Write-Host "Found $($videosResponse.Count) videos" -ForegroundColor Green
    foreach ($video in $videosResponse) {
        Write-Host "  - $($video.title) (ID: $($video.id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Get Videos Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Specific Video
Write-Host "`n3. Testing Get Specific Video..." -ForegroundColor Yellow
try {
    $videoResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos/tetepus10e6" -Method GET
    Write-Host "Video: $($videoResponse.title)" -ForegroundColor Green
    Write-Host "  Description: $($videoResponse.description)" -ForegroundColor Cyan
    Write-Host "  Duration: $($videoResponse.duration)" -ForegroundColor Cyan
} catch {
    Write-Host "Get Specific Video Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
