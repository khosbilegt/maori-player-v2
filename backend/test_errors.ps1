# PowerShell script to test consistent error handling
Write-Host "Testing Video Player Backend Error Handling..." -ForegroundColor Green

$baseUrl = "http://localhost:8080/api/v1"

# Test 1: Get non-existent video
Write-Host "`n1. Testing GET non-existent video..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/videos/nonexistent123" -Method GET
    Write-Host "Unexpected success: $($response | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
}

# Test 2: Create video with invalid data
Write-Host "`n2. Testing POST with invalid data..." -ForegroundColor Yellow
$invalidVideoData = @{
    title = ""  # Empty title should fail validation
    video = "invalid-url"  # Invalid URL should fail validation
    duration = "invalid-duration"  # Invalid duration format
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/videos" -Method POST -Body $invalidVideoData -ContentType "application/json"
    Write-Host "Unexpected success: $($response | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected validation error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
    if ($errorResponse.validation_errors) {
        Write-Host "  Validation Errors:" -ForegroundColor Green
        foreach ($ve in $errorResponse.validation_errors) {
            Write-Host "    - $($ve.field): $($ve.message)" -ForegroundColor Green
        }
    }
}

# Test 3: Update non-existent video
Write-Host "`n3. Testing PUT non-existent video..." -ForegroundColor Yellow
$updateData = @{
    title = "Updated Video"
    video = "https://example.com/video.mp4"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/videos/nonexistent123" -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "Unexpected success: $($response | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
}

# Test 4: Delete non-existent video
Write-Host "`n4. Testing DELETE non-existent video..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/videos/nonexistent123" -Method DELETE
    Write-Host "Unexpected success" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
}

# Test 5: Invalid JSON in request body
Write-Host "`n5. Testing invalid JSON..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/videos" -Method POST -Body "invalid json" -ContentType "application/json"
    Write-Host "Unexpected success: $($response | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
    Write-Host "  Details: $($errorResponse.details)" -ForegroundColor Green
}

# Test 6: Empty video ID
Write-Host "`n6. Testing empty video ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/videos/" -Method GET
    Write-Host "Unexpected success: $($response | ConvertTo-Json)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error response:" -ForegroundColor Green
    Write-Host "  Code: $($errorResponse.code)" -ForegroundColor Green
    Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Green
}

Write-Host "`nError handling testing completed!" -ForegroundColor Green
Write-Host "All errors should have consistent structure with 'code' and 'message' fields." -ForegroundColor Cyan
