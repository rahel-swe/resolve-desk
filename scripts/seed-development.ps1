$ErrorActionPreference = 'Stop'
$seedRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($env:DevelopmentSeed__Password)) {
    throw 'Set DevelopmentSeed__Password to a private 16–72 byte password. No default password is provided.'
}

$previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
try {
    $env:ASPNETCORE_ENVIRONMENT = 'Development'
    # A separate configuration avoids touching a running Debug server's binaries.
    & dotnet run --project (Join-Path $seedRoot 'server/ResolveDesk.csproj') --configuration Release --no-launch-profile -- --seed-development
    if ($LASTEXITCODE -ne 0) { throw 'Development seed failed. See the preceding diagnostic.' }
} finally {
    $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
}
