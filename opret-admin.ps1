# Opretter Carsten som administrator i Firestore brugere-samlingen
param(
    [string]$Kode = ""
)

$apiKey    = "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU"
$email     = "cg@gallerieg.dk"
$projectId = "olsenklanen-familieside"

if (-not $Kode) {
    $Kode = Read-Host "Firebase adgangskode for $email"
}

Write-Host "Logger ind..." -ForegroundColor Cyan

# Trin 1: Hent ID-token via Firebase Auth
$signInBody = @{
    email            = $email
    password         = $Kode
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $auth = Invoke-RestMethod `
        -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$apiKey" `
        -Method Post `
        -Body $signInBody `
        -ContentType "application/json"
} catch {
    Write-Host "Login fejlede: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$idToken = $auth.idToken
Write-Host "Login OK. Opretter dokument..." -ForegroundColor Cyan

# Trin 2: PATCH dokument i brugere-samlingen (dokument-ID = email, @ kodet som %40)
$docId  = "cg%40gallerieg.dk"
$url    = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/brugere/$docId"

$now    = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$docBody = @{
    fields = @{
        email    = @{ stringValue = $email }
        navn     = @{ stringValue = "Carsten Gram" }
        rolle    = @{ stringValue = "administrator" }
        oprettet = @{ timestampValue = $now }
    }
} | ConvertTo-Json -Depth 5

try {
    $result = Invoke-RestMethod `
        -Uri $url `
        -Method Patch `
        -Body $docBody `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $idToken" }

    Write-Host ""
    Write-Host "Carsten er oprettet som administrator i brugere-samlingen." -ForegroundColor Green
    Write-Host "Dokument-sti: brugere/cg@gallerieg.dk" -ForegroundColor Green
} catch {
    $errBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    $errMsg  = if ($errBody) { $errBody.error.message } else { $_.Exception.Message }
    Write-Host "Firestore-fejl: $errMsg" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mulig aarsag: Firestore-sikkerhedsreglerne tillader ikke skrivning." -ForegroundColor Yellow
    Write-Host "Opret dokumentet manuelt i Firebase Console:" -ForegroundColor Yellow
    Write-Host "  Samling: brugere" -ForegroundColor Yellow
    Write-Host "  Dokument-ID: cg@gallerieg.dk" -ForegroundColor Yellow
    Write-Host "  Felter: email=cg@gallerieg.dk, navn=Carsten Gram, rolle=administrator" -ForegroundColor Yellow
}
