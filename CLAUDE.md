# ruth-code-skills — CLAUDE.md

## What this repo is

A collection of Claude Code skills, agents, and commands for Ruth's client project workflow.
Stack: React + Vite + Tailwind + shadcn/ui + Supabase + Vercel + Brevo.

## Structure

```
skills/         — one directory per skill, each with SKILL.md + optional assets/
agents/         — Claude Code sub-agents (.md files with frontmatter)
commands/       — slash commands (.md files with frontmatter)
install.sh      — Mac/Linux installer
install.ps1     — Windows installer
```

## Conventions

- All SKILL.md files use frontmatter: name, description, version, user-invocable
- Agent files use frontmatter: name, description, tools, model
- Command files use frontmatter: description. Body references an agent via its name.
- Skills are written in Hebrew (user-facing). Agents and commands are in English.
- When updating a skill, mirror the change in this repo and push.

## Do Not Break

- install.sh and install.ps1 must stay in sync (same directories, same skill list)
- Agent files in agents/ must have valid frontmatter — Claude Code won't load them otherwise
- commands/$ARGUMENTS placeholder must be preserved in command files

## Adding a new skill

1. Create `skills/new-skill-name/SKILL.md`
2. Add to the SKILLS array in install.sh and install.ps1
3. Add a row to the Skills table in README.md
4. Install locally: `cp -r skills/new-skill-name ~/.claude/skills/`

## Agents (current)

| Agent | Role |
|-------|------|
| `feature-prompt-builder-quick` | Reads codebase, builds prompt from short description |
| `feature-prompt-builder-spec` | Reads codebase, breaks spec into Parts, builds prompt |
| `qa-checker` | Runs typecheck/build, scans for artifacts, returns PASS/FAIL report |
| `pr-finalizer` | Updates CHANGELOG, opens PR with structured Hebrew description |

## Adding a new agent

1. Create `agents/agent-name.md` with frontmatter
2. Add a row to the Agents table in README.md and in CLAUDE.md
3. Install locally: `cp agents/agent-name.md ~/.claude/agents/`

## Adding a new command

1. Create `commands/command-name.md` with frontmatter
2. Add a row to the Commands table in README.md
3. Install locally: `cp commands/command-name.md ~/.claude/commands/`
