# ruth-code-skills

A collection of Claude Code skills, agents, and commands for building client projects with Supabase + React + Vercel.

## Skills

| Skill | Description |
|-------|-------------|
| `client-project-init` | Master checklist for starting a new client project — invokes all other skills in order |
| `supabase-logging` | Adds a `system_logs` table + `log_event()` function + `/admin/logs` page |
| `supabase-drive-backup` | Daily automated backup to Google Drive (Excel + pg_dump) |
| `legal-pages-israel` | Privacy Policy + Terms of Service for Israeli internal sites |
| `project-about-page` | Public `/about` page for closed apps (Google OAuth + SEO) |

## Agents

| Agent | Description |
|-------|-------------|
| `feature-prompt-builder-quick` | Builds a prompt for a small feature described in plain text |
| `feature-prompt-builder-spec` | Builds a prompt for a large feature with a full spec |

## Commands

| Command | Description |
|---------|-------------|
| `/quick-feature` | Invoke feature-prompt-builder-quick |
| `/spec-feature` | Invoke feature-prompt-builder-spec |

## Stack

React + Vite + Tailwind + shadcn/ui + Supabase + Vercel + Brevo

## Install

**Mac / Linux:**
```bash
git clone https://github.com/ruthprissman/ruth-code-skills.git
cd ruth-code-skills
chmod +x install.sh && ./install.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/ruthprissman/ruth-code-skills.git
cd ruth-code-skills
.\install.ps1
```

Installs to:
- `~/.claude/skills/` — skills
- `~/.claude/agents/` — agents
- `~/.claude/commands/` — commands

## Usage — new project

```
/client-project-init
```

## Usage — continuing an existing project

For a small feature request:
```
/quick-feature add a button that exports the table to Excel
```

For a large feature with a spec:
```
/spec-feature [paste full spec]
```

Or invoke individual skills directly:
```
/supabase-logging
/supabase-drive-backup
/legal-pages-israel
/project-about-page
```
