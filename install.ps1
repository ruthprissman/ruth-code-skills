# Installs skills, agents, and commands to %USERPROFILE%\.claude\

$skillsDir   = "$env:USERPROFILE\.claude\skills"
$agentsDir   = "$env:USERPROFILE\.claude\agents"
$commandsDir = "$env:USERPROFILE\.claude\commands"

$skills = @('client-project-init', 'supabase-logging', 'supabase-drive-backup', 'legal-pages-israel', 'project-about-page')

New-Item -ItemType Directory -Force -Path $skillsDir   | Out-Null
New-Item -ItemType Directory -Force -Path $agentsDir   | Out-Null
New-Item -ItemType Directory -Force -Path $commandsDir | Out-Null

foreach ($skill in $skills) {
    Copy-Item -Recurse -Force ".\$skill" $skillsDir
    Write-Host "Installed skill: $skill"
}

Get-ChildItem ".\agents\*.md" | ForEach-Object {
    Copy-Item -Force $_.FullName $agentsDir
    Write-Host "Installed agent: $($_.BaseName)"
}

Get-ChildItem ".\commands\*.md" | ForEach-Object {
    Copy-Item -Force $_.FullName $commandsDir
    Write-Host "Installed command: $($_.BaseName)"
}

Write-Host ""
Write-Host "Done."
Write-Host "  Skills   -> $skillsDir"
Write-Host "  Agents   -> $agentsDir"
Write-Host "  Commands -> $commandsDir"
Write-Host ""
Write-Host "Restart Claude Code and use /client-project-init to get started."
