# TC-07 - Creacion valida de proceso de headhunting
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

$rrhhToken = Login "rrhh@agileict.local" "demo1234"

$empresasResp = Invoke-Api -Method "GET" -Path "/empresas" -Token $rrhhToken
if ($empresasResp.Status -ne 200) { $empresasResp = Invoke-Api -Method "GET" -Path "/auth/companies" }
if ($empresasResp.Status -ne 200) { Skip-Test "No se pudo obtener empresaClienteId automaticamente" }
$empresas = $empresasResp.Body | ConvertFrom-Json
$empresaId = if ($empresas -is [array]) { $empresas[0].id } else { $empresas.id }

$me = Invoke-Api -Method "GET" -Path "/rrhh/me" -Token $rrhhToken
if ($me.Status -ne 200) { Assert-Status "TC-07 Obtener RRHH" $me @(200) }
$rrhhId = ($me.Body | ConvertFrom-Json).id

$body = @{
    empresaClienteId=$empresaId;
    responsableRrhhId=$rrhhId;
    titulo="Proceso Backend Senior $Uniq";
    descripcion="Proceso de prueba para validar creacion de headhunting confidencial";
    nivelConfidencialidad="CONFIDENTIAL";
    nivelExperienciaMinimo="Senior";
    puestos=@(@{
        titulo="Backend Senior"; senioridad="SENIOR"; modalidad="Hibrido"; ubicacion="Madrid"; area="Backend";
        descripcion="Desarrollo Java y Spring Boot";
        tecnologiasRequeridas="Java, Spring Boot, PostgreSQL";
        tipoContrato="Indefinido";
        sectorRequerido="TECNOLOGIA_IT"
    })
}
$resp = Invoke-Api -Method "POST" -Path "/procesos" -Body $body -Token $rrhhToken
Assert-Status "TC-07 Crear proceso valido" $resp @(201)
