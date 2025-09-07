# Test script for Watch History API endpoints
# Make sure the backend server is running before executing this script

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "Testing Watch History API endpoints..." -ForegroundColor Green

# Test 1: Register a user
Write-Host "`n1. Registering a test user..." -ForegroundColor Yellow
$registerData = @{
    email = "test@example.com"
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "User registered successfully" -ForegroundColor Green
} catch {
    Write-Host "User registration failed or user already exists: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login to get JWT token
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Login successful, token obtained" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set up headers with JWT token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Create/Update watch history
Write-Host "`n3. Creating/Updating watch history..." -ForegroundColor Yellow
$watchHistoryData = @{
    video_id = "test-video-1"
    progress = 0.5
    current_time = 120.0
    duration = 240.0
    completed = $false
} | ConvertTo-Json

try {
    $watchHistoryResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history" -Method POST -Body $watchHistoryData -Headers $headers
    Write-Host "Watch history created/updated successfully" -ForegroundColor Green
    Write-Host "Response: $($watchHistoryResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to create/update watch history: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get watch history for a specific video
Write-Host "`n4. Getting watch history for specific video..." -ForegroundColor Yellow
try {
    $videoHistoryResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history/video?video_id=test-video-1" -Method GET -Headers $headers
    Write-Host "Video watch history retrieved successfully" -ForegroundColor Green
    Write-Host "Response: $($videoHistoryResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to get video watch history: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get all watch history
Write-Host "`n5. Getting all watch history..." -ForegroundColor Yellow
try {
    $allHistoryResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history" -Method GET -Headers $headers
    Write-Host "All watch history retrieved successfully" -ForegroundColor Green
    Write-Host "Response: $($allHistoryResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to get all watch history: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get recent watched videos
Write-Host "`n6. Getting recent watched videos..." -ForegroundColor Yellow
try {
    $recentResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history/recent?limit=5" -Method GET -Headers $headers
    Write-Host "Recent watched videos retrieved successfully" -ForegroundColor Green
    Write-Host "Response: $($recentResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to get recent watched videos: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get completed videos
Write-Host "`n7. Getting completed videos..." -ForegroundColor Yellow
try {
    $completedResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history/completed" -Method GET -Headers $headers
    Write-Host "Completed videos retrieved successfully" -ForegroundColor Green
    Write-Host "Response: $($completedResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to get completed videos: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Update watch history to mark as completed
Write-Host "`n8. Updating watch history to mark as completed..." -ForegroundColor Yellow
$completedWatchHistoryData = @{
    video_id = "test-video-1"
    progress = 1.0
    current_time = 240.0
    duration = 240.0
    completed = $true
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/watch-history" -Method POST -Body $completedWatchHistoryData -Headers $headers
    Write-Host "Watch history updated to completed successfully" -ForegroundColor Green
    Write-Host "Response: $($updateResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to update watch history: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Delete watch history
Write-Host "`n9. Deleting watch history..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/watch-history?video_id=test-video-1" -Method DELETE -Headers $headers
    Write-Host "Watch history deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to delete watch history: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nWatch History API testing completed!" -ForegroundColor Green
