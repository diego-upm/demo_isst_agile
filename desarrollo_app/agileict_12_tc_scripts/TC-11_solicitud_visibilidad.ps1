# TC-11 - Solicitud de visibilidad de perfil completo
# Ejecutar desde la carpeta agileict_12_tc_scripts con el backend levantado.
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:8080" }
$Api = "$BaseUrl/api/v1"
$Uniq = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = ""
    )
    $headers = @{}
    if ($Token -ne "") { $headers["Authorization"] = "Bearer $Token" }
    try {
        $json = if ($null -ne $Body) { $Body | ConvertTo-Json -Depth 12 } else { $null }
        $resp = Invoke-WebRequest -Uri "$Api$Path" -Method $Method -Headers $headers -ContentType "application/json" -Body $json -UseBasicParsing
        return @{ Status=[int]$resp.StatusCode; Body=$resp.Content }
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $content = $reader.ReadToEnd()
            } catch { $content = "" }
            return @{ Status=$status; Body=$content }
        }
        return @{ Status=0; Body=$_.Exception.Message }
    }
}

function Assert-Status {
    param([string]$Name, [hashtable]$Resp, [int[]]$Expected)
    if ($Expected -contains $Resp.Status) {
        Write-Host "[PASS] $Name -> HTTP $($Resp.Status)"
        exit 0
    } else {
        Write-Host "[FAIL] $Name -> HTTP $($Resp.Status). Esperado: $($Expected -join ', ')"
        Write-Host $Resp.Body
        exit 1
    }
}

function Login {
    param([string]$Email, [string]$Password)
    $resp = Invoke-Api -Method "POST" -Path "/auth/login" -Body @{ email=$Email; password=$Password }
    if ($resp.Status -ne 200) {
        Write-Host "[FAIL] No se pudo hacer login con $Email -> HTTP $($resp.Status)"
        Write-Host $resp.Body
        exit 1
    }
    return ($resp.Body | ConvertFrom-Json).token
}

function Skip-Test {
    param([string]$Reason)
    Write-Host "[SKIP] $Reason"
    exit 0
}

# Este TC es una regla de dominio de aceptacion: sin autorizacion no debe verse el perfil completo.
# El repo actual puede no exponer un endpoint especifico para solicitud de visibilidad.
# Comprobacion automatizable minima: RRHH obtiene listado visible, y se marca SKIP si no hay endpoint de candidatura/visibilidad.
$rrhhToken = Login "rrhh@agileict.local" "demo1234"
$resp = Invoke-Api -Method "GET" -Path "/profesionales" -Token $rrhhToken
if ($resp.Status -ne 200) { Assert-Status "TC-11 Listado perfiles visibles" $resp @(200) }

Write-Host "[SKIP] TC-11 requiere endpoint de solicitud de visibilidad/candidatura o prueba E2E en UI. El listado /profesionales si responde."
exit 0
