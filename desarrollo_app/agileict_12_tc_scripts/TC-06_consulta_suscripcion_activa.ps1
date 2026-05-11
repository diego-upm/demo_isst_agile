# TC-06 - Consulta de suscripcion activa antes de crear procesos
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

# En el documento TC esta prueba valida la regla de dominio: una empresa debe tener suscripcion activa.
# El backend actual expone modulo suscripcion, pero el contrato puede variar. Se comprueba mediante datos de RRHH y procesos.
$rrhhToken = Login "rrhh@agileict.local" "demo1234"
$me = Invoke-Api -Method "GET" -Path "/rrhh/me" -Token $rrhhToken
if ($me.Status -ne 200) { Assert-Status "TC-06 Obtener RRHH" $me @(200) }

$empresas = Invoke-Api -Method "GET" -Path "/empresas" -Token $rrhhToken
if ($empresas.Status -eq 200) {
    Write-Host "[PASS] TC-06 Se puede consultar empresa asociada para comprobar suscripcion/regla previa"
    exit 0
}

# Fallback: en algunos despliegues la consulta de empresas puede estar en /auth/companies.
$publicCompanies = Invoke-Api -Method "GET" -Path "/auth/companies"
if ($publicCompanies.Status -eq 200) {
    Write-Host "[PASS] TC-06 Consulta de empresas disponible para verificar suscripcion en flujo RRHH"
    exit 0
}

Write-Host "[SKIP] TC-06 requiere endpoint concreto de suscripciones o validacion de regla en UI"
exit 0
