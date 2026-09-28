$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "OJI place seed started"
Write-Host ""

$overpassUrl = "https://overpass-api.de/api/interpreter"

$query = '[out:json][timeout:90];(nwr["leisure"="park"]["name"](37.413,126.734,37.715,127.269);nwr["leisure"="pitch"]["sport"="soccer"]["name"](37.413,126.734,37.715,127.269);nwr["leisure"="pitch"]["sport"="basketball"]["name"](37.413,126.734,37.715,127.269););out center tags;'

Write-Host "Requesting map data..."

$response = Invoke-RestMethod `
    -Uri $overpassUrl `
    -Method Post `
    -Body @{ data = $query } `
    -UserAgent "OJI-development-project"

Write-Host "Map data received"

$parks = @()
$soccer = @()
$basketball = @()

foreach ($element in $response.elements) {

    if (-not $element.tags.name) {
        continue
    }

    $latitude = $null
    $longitude = $null

    if ($null -ne $element.lat -and $null -ne $element.lon) {
        $latitude = [double]$element.lat
        $longitude = [double]$element.lon
    }
    elseif ($null -ne $element.center) {
        $latitude = [double]$element.center.lat
        $longitude = [double]$element.center.lon
    }

    if ($null -eq $latitude -or $null -eq $longitude) {
        continue
    }

    $addressParts = @()

    if ($element.tags.'addr:city') {
        $addressParts += [string]$element.tags.'addr:city'
    }

    if ($element.tags.'addr:district') {
        $addressParts += [string]$element.tags.'addr:district'
    }

    if ($element.tags.'addr:street') {
        $addressParts += [string]$element.tags.'addr:street'
    }

    if ($element.tags.'addr:housenumber') {
        $addressParts += [string]$element.tags.'addr:housenumber'
    }

    if ($addressParts.Count -eq 0) {
        $address = "Seoul"
    }
    else {
        $address = $addressParts -join " "
    }

    $item = [PSCustomObject]@{
        SourceId = "$($element.type)/$($element.id)"
        Name = [string]$element.tags.name
        Address = $address
        Latitude = $latitude
        Longitude = $longitude
    }

    if ($element.tags.leisure -eq "park") {
        $parks += $item
        continue
    }

    if (
        $element.tags.leisure -eq "pitch" -and
        $element.tags.sport -eq "soccer"
    ) {
        $soccer += $item
        continue
    }

    if (
        $element.tags.leisure -eq "pitch" -and
        $element.tags.sport -eq "basketball"
    ) {
        $basketball += $item
    }
}

$parks = @(
    $parks |
    Sort-Object Name -Unique |
    Select-Object -First 20
)

$soccer = @(
    $soccer |
    Sort-Object Name -Unique |
    Select-Object -First 15
)

$basketball = @(
    $basketball |
    Sort-Object Name -Unique |
    Select-Object -First 15
)

Write-Host ""
Write-Host "Parks      : $($parks.Count)"
Write-Host "Soccer     : $($soccer.Count)"
Write-Host "Basketball : $($basketball.Count)"
Write-Host ""

function Escape-Sql {
    param([string]$Value)

    if ($null -eq $Value) {
        return ""
    }

    return $Value.Replace("'", "''")
}

$builder = New-Object System.Text.StringBuilder

[void]$builder.AppendLine("ALTER TABLE places ADD COLUMN IF NOT EXISTS source VARCHAR(30);")
[void]$builder.AppendLine("ALTER TABLE places ADD COLUMN IF NOT EXISTS source_id VARCHAR(100);")
[void]$builder.AppendLine("ALTER TABLE places ADD COLUMN IF NOT EXISTS place_type VARCHAR(30);")
[void]$builder.AppendLine("ALTER TABLE places ADD COLUMN IF NOT EXISTS fee_status VARCHAR(30) DEFAULT 'UNKNOWN';")
[void]$builder.AppendLine("DELETE FROM places WHERE source = 'OSM';")

function Add-Place {
    param(
        $Place,
        [int]$ActivityId,
        [string]$PlaceType,
        [string]$FeeStatus
    )

    $name = Escape-Sql $Place.Name
    $address = Escape-Sql $Place.Address
    $sourceId = Escape-Sql $Place.SourceId

    $line = "INSERT INTO places (activity_id, name, address, latitude, longitude, source, source_id, place_type, fee_status) VALUES ($ActivityId, '$name', '$address', $($Place.Latitude), $($Place.Longitude), 'OSM', '$sourceId', '$PlaceType', '$FeeStatus');"

    [void]$builder.AppendLine($line)
}

foreach ($place in $parks) {
    Add-Place `
        -Place $place `
        -ActivityId 45 `
        -PlaceType "PARK" `
        -FeeStatus "FREE"
}

foreach ($place in $soccer) {
    Add-Place `
        -Place $place `
        -ActivityId 43 `
        -PlaceType "SOCCER" `
        -FeeStatus "UNKNOWN"
}

foreach ($place in $basketball) {
    Add-Place `
        -Place $place `
        -ActivityId 44 `
        -PlaceType "BASKETBALL" `
        -FeeStatus "UNKNOWN"
}

$sqlPath = "C:\Users\jang1\OneDrive\Desktop\oji\places-seoul.sql"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $sqlPath,
    $builder.ToString(),
    $utf8NoBom
)

Write-Host "SQL file created"

docker cp `
    "$sqlPath" `
    docker-practice-db:/tmp/places-seoul.sql

if ($LASTEXITCODE -ne 0) {
    throw "docker cp failed"
}

docker exec `
    docker-practice-db `
    psql `
    -U admin `
    -d practice `
    -f /tmp/places-seoul.sql

if ($LASTEXITCODE -ne 0) {
    throw "psql failed"
}

Write-Host ""
Write-Host "OJI place seed completed"