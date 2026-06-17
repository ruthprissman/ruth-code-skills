# Installs all skills to %USERPROFILE%\.claude\skills\

$skillsDir = "$env:USERPROFILE\.claude\skills"
$skills = @('client-project-init', 'supabase-logging', 'supabase-drive-backup', 'legal-pages-israel', 'project-about-page')

New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

foreach ($skill in $skills) {
    Copy-Item -Recurse -Force ".\$skill" $skillsDir
    Write-Host "Installed: $skill"
}

Write-Host ""
Write-Host "Done. Skills installed to $skillsDir"
Write-Host "Restart Claude Code and use /client-project-init to get started."
