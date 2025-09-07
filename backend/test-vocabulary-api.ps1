# Test script for Vocabulary API endpoints
# Make sure the backend server is running on localhost:8080

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "Testing Vocabulary API endpoints..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Get all vocabulary items
Write-Host "1. Testing GET /vocabulary" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) vocabulary items" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "   First item: $($response[0].maori) - $($response[0].english)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get specific vocabulary item (if any exist)
Write-Host "2. Testing GET /vocabulary/{id}" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method GET -ContentType "application/json"
    if ($response.Count -gt 0) {
        $firstId = $response[0].id
        $itemResponse = Invoke-RestMethod -Uri "$baseUrl/vocabulary/$firstId" -Method GET -ContentType "application/json"
        Write-Host "✅ Success! Retrieved vocabulary item: $($itemResponse.maori) - $($itemResponse.english)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No vocabulary items found to test with" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create a new vocabulary item
Write-Host "3. Testing POST /vocabulary" -ForegroundColor Cyan
$newVocabulary = @{
    maori = "Aroha"
    english = "Love"
    pronunciation = "AH-roh-hah"
    description = "A feeling of love, compassion, or empathy."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method POST -Body $newVocabulary -ContentType "application/json"
    Write-Host "✅ Success! Created vocabulary item: $($response.maori) - $($response.english)" -ForegroundColor Green
    Write-Host "   ID: $($response.id)" -ForegroundColor Gray
    $createdId = $response.id
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}
Write-Host ""

# Test 4: Update the created vocabulary item
if ($createdId) {
    Write-Host "4. Testing PUT /vocabulary/{id}" -ForegroundColor Cyan
    $updatedVocabulary = @{
        maori = "Aroha"
        english = "Love and Compassion"
        pronunciation = "AH-roh-hah"
        description = "A feeling of love, compassion, empathy, and care for others."
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary/$createdId" -Method PUT -Body $updatedVocabulary -ContentType "application/json"
        Write-Host "✅ Success! Updated vocabulary item: $($response.maori) - $($response.english)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Search vocabulary
Write-Host "5. Testing GET /vocabulary/search?q=hello" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary/search?q=hello" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) items matching 'hello'" -ForegroundColor Green
    foreach ($item in $response) {
        Write-Host "   - $($item.maori) - $($item.english)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Search with Māori term
Write-Host "6. Testing GET /vocabulary/search?q=ora" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary/search?q=ora" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) items matching 'ora'" -ForegroundColor Green
    foreach ($item in $response) {
        Write-Host "   - $($item.maori) - $($item.english)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Delete the created vocabulary item
if ($createdId) {
    Write-Host "7. Testing DELETE /vocabulary/{id}" -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/vocabulary/$createdId" -Method DELETE -ContentType "application/json"
        Write-Host "✅ Success! Deleted vocabulary item with ID: $createdId" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 8: Test error handling - Get non-existent vocabulary
Write-Host "8. Testing error handling - GET /vocabulary/non-existent" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/vocabulary/non-existent" -Method GET -ContentType "application/json"
    Write-Host "❌ Unexpected success - should have failed" -ForegroundColor Red
} catch {
    Write-Host "✅ Expected error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

Write-Host "Vocabulary API testing completed!" -ForegroundColor Green
