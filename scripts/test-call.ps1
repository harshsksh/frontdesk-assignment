# PowerShell script to test the AI receptionist system
# Usage: .\scripts\test-call.ps1 [phone] [name] [question]

param(
    [string]$Phone = "+1234567890",
    [string]$Name = "Test User",
    [string]$Question = "What are your hours?"
)

Write-Host "📞 Simulating call from $Name ($Phone)" -ForegroundColor Cyan
Write-Host "❓ Question: $Question" -ForegroundColor Yellow
Write-Host ""

$body = @{
    phone = $Phone
    name = $Name
    question = $Question
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/calls/simulate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

