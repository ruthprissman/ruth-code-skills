#!/bin/bash
# Installs all skills to ~/.claude/skills/

SKILLS_DIR="$HOME/.claude/skills"
SKILLS=(client-project-init supabase-logging supabase-drive-backup legal-pages-israel project-about-page)

mkdir -p "$SKILLS_DIR"

for skill in "${SKILLS[@]}"; do
  cp -r "./$skill" "$SKILLS_DIR/"
  echo "Installed: $skill"
done

echo ""
echo "Done. Skills installed to $SKILLS_DIR"
echo "Restart Claude Code and use /client-project-init to get started."
