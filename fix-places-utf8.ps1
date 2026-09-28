$ErrorActionPreference = "Stop"

$root = "C:\Users\jang1\OneDrive\Desktop\oji"

$queryPath = Join-Path $root "overpass-seoul.query"
$responsePath = Join-Path $root "overpass-seoul.json"
$sqlPath = Join-Path $root "places-seoul-utf8.sql"

$overpassUrl = "https://overpass-api.de/api/interpreter"

$query = @"
[out:json][timeout:90];

rel
  ["boundary"="administrative"]
  ["ISO3166-2"="KR-11"];

map_to_area -> .seoul;

(
  nwr
    ["leisure"="park"]
    ["name"]
    (area.seoul);

  nwr
    ["leisure"="pitch"]
    ["sport"="soccer"]
    ["name"]
    (area.seoul);

  nwr
    ["leisure"="pitch"]
    ["sport"="basketball"]
    ["name"]
    (area.seoul);
);

out center tags;
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $queryPath,
    $query,
    $utf8NoBom
)

Write-Host "Downloading UTF-8 map data..."

& curl.exe `
  -sS `
  --fail-with-body `
  -X POST `
  -H "Content-Type: application/x-www-form-urlencoded" `
  --data-urlencode "data@$queryPath" `
  $overpassUrl `
  -o $responsePath

if ($LASTEXITCODE -ne 0) {
    throw "Map download failed."
}

$jsonText = [System.IO.File]::ReadAllText(
    $responsePath,
    [System.Text.Encoding]::UTF8
)

$response = $jsonText | ConvertFrom-Json

$parks = @()
$soccer = @()
$basketball = @()

foreach ($element in $response.elements) {

    if (-not $element.tags.name) {
        continue
    }

    $lat = $null
    $lng = $null

    if ($null -ne $element.lat -and $null -ne $element.lon) {
        $lat = [double]$element.lat
        $lng = [double]$element.lon
    }
    elseif ($null -ne $element.center) {
        $lat = [double]$element.center.lat
        $lng = [double]$element.center.lon
    }

    if ($null -eq $lat -or $null -eq $lng) {
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

    if ($addressParts.Count -gt 0) {
        $address = $addressParts -join " "
    }
    else {
        $address = "Seoul"
    }

    $item = [PSCustomObject]@{
        SourceId = "$($element.type)/$($element.id)"
        Name = [string]$element.tags.name
        Address = $address
        Latitude = $lat
        Longitude = $lng
    }

    if ($element.tags.leisure -eq "park") {
        $parks += $item
    }
    elseif (
        $element.tags.leisure -eq "pitch" -and
        $element.tags.sport -eq "soccer"
    ) {
        $soccer += $item
    }
    elseif (
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

[void]$builder.AppendLine(
    "DELETE FROM places WHERE source = 'OSM';"
)

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

    $sql = "INSERT INTO places (activity_id, name, address, latitude, longitude, source, source_id, place_type, fee_status) VALUES ($ActivityId, '$name', '$address', $($Place.Latitude), $($Place.Longitude), 'OSM', '$sourceId', '$PlaceType', '$FeeStatus');"

    [void]$builder.AppendLine($sql)
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

[System.IO.File]::WriteAllText(
    $sqlPath,
    $builder.ToString(),
    $utf8NoBom
)

docker cp `
    "$sqlPath" `
    docker-practice-db:/tmp/places-seoul-utf8.sql

if ($LASTEXITCODE -ne 0) {
    throw "docker cp failed"
}

docker exec `
    docker-practice-db `
    psql `
    -U admin `
    -d practice `
    -f /tmp/places-seoul-utf8.sql

if ($LASTEXITCODE -ne 0) {
    throw "Database import failed"
}

Write-Host ""
Write-Host "UTF-8 place import completed."