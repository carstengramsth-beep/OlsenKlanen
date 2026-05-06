# Opretter redaktører i Firestore brugere-samlingen
param(
    [string]$Kode = ""
)

$apiKey    = "AIzaSyDlydsBrJQswqtiqTLM4yXDQWHbAolMpZU"
$adminEmail = "cg@gallerieg.dk"
$projectId = "olsenklanen-familieside"

if (-not $Kode) {
    $Kode = Read-Host "Firebase adgangskode for $adminEmail"
}

Write-Host "Logger ind..." -ForegroundColor Cyan

# Trin 1: Hent ID-token via Firebase Auth
$signInBody = @{
    email             = $adminEmail
    password          = $Kode
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
Write-Host "Login OK." -ForegroundColor Green

# Redaktører — ret navn hvis nødvendigt
$redaktorer = @(
    @{ email = "kurt@vormslev.dk";  navn = "Kurt Vormslev Olsen" },
    @{ email = "safi@dr.dk";        navn = "Sanne Gram Fadel" },
    @{ email = "tvo@ishoejby.dk";   navn = "Tommy Vormslev Olsen" },
    @{ email = "kld@inmobia.com";   navn = "Karin Lund" }
)

foreach ($r in $redaktorer) {
    $docId  = [System.Uri]::EscapeDataString($r.email)
    $url    = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/brugere/$docId"
    $now    = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

    $docBody = @{
        fields = @{
            email    = @{ stringValue = $r.email }
            navn     = @{ stringValue = $r.navn }
            rolle    = @{ stringValue = "redaktør" }
            oprettet = @{ timestampValue = $now }
        }
    } | ConvertTo-Json -Depth 5

    try {
        Invoke-RestMethod `
            -Uri $url `
            -Method Patch `
            -Body $docBody `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $idToken" } | Out-Null

        Write-Host "OK  $($r.navn) ($($r.email))" -ForegroundColor Green
    } catch {
        $errBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        $errMsg  = if ($errBody) { $errBody.error.message } else { $_.Exception.Message }
        Write-Host "FEJL $($r.email): $errMsg" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Faerdig." -ForegroundColor Yellow
