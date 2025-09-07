# Simple PowerShell script to test the API
Write-Host "Testing Video Player Backend API..." -ForegroundColor Green

# Test health endpoint
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET
    Write-Host "Health check: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test create video
Write-Host "`n2. Testing create video..." -ForegroundColor Yellow
$videoData = @{
    title = "Test Video"
    description = "This is a test video"
    thumbnail = "https://example.com/thumb.jpg"
    video = "https://example.com/video.mp4"
    subtitle = "/test.vtt"
    duration = "5:30"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos" -Method POST -Body $videoData -ContentType "application/json"
    Write-Host "Video created: $($createResponse | ConvertTo-Json)" -ForegroundColor Green
    $videoId = $createResponse.id
} catch {
    Write-Host "Create video failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test get all videos
Write-Host "`n3. Testing get all videos..." -ForegroundColor Yellow
try {
    $allVideos = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos" -Method GET
    Write-Host "All videos: $($allVideos | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Get all videos failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test get single video
Write-Host "`n4. Testing get single video..." -ForegroundColor Yellow
try {
    $singleVideo = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos/$videoId" -Method GET
    Write-Host "Single video: $($singleVideo | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Get single video failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test update video
Write-Host "`n5. Testing update video..." -ForegroundColor Yellow
$updateData = @{
    title = "Updated Test Video"
    description = "This is an updated test video"
    thumbnail = "https://example.com/updated-thumb.jpg"
    video = "https://example.com/updated-video.mp4"
    subtitle = "/updated-test.vtt"
    duration = "6:45"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos/$videoId" -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "Video updated: $($updateResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Update video failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test delete video
Write-Host "`n6. Testing delete video..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/v1/videos/$videoId" -Method DELETE
    Write-Host "Video deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "Delete video failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green
