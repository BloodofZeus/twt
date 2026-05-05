$uri = "http://localhost/save_document.php"
$body = @{
    filename = "test_invoice.json"
    folder = "invoices/TEST_ID"
    content = "eyAidGVzdCI6ICJkYXRhIiB9" # base64 for { "test": "data" }
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body
    Write-Host "Response from server:"
    $response | ConvertTo-Json
} catch {
    Write-Host "Error occurred:"
    $_.Exception.Message
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
}
