#!/bin/bash
# Installs skills, agents, and commands to ~/.claude/

SKILLS_DIR="$HOME/.claude/skills"
AGENTS_DIR="$HOME/.claude/agents"
COMMANDS_DIR="$HOME/.claude/commands"

SKILLS=(client-project-init supabase-logging supabase-drive-backup legal-pages-israel project-about-page)

mkdir -p "$SKILLS_DIR" "$AGENTS_DIR" "$COMMANDS_DIR"

for skill in "${SKILLS[@]}"; do
  cp -r "./$skill" "$SKILLS_DIR/"
  echo "Installed skill: $skill"
done

cp ./agents/*.md "$AGENTS_DIR/"
echo "Installed agents: $(ls agents/*.md | xargs -I{} basename {} .md | tr '\n' ' ')"

cp ./commands/*.md "$COMMANDS_DIR/"
echo "Installed commands: $(ls commands/*.md | xargs -I{} basename {} .md | tr '\n' ' ')"

echo ""
echo "Done."
echo "  Skills   → $SKILLS_DIR"
echo "  Agents   → $AGENTS_DIR"
echo "  Commands → $COMMANDS_DIR"
echo ""
echo "Restart Claude Code and use /client-project-init to get started."
