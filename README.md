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
| `orchestration-rules` | Always-active rules: prompt decomposition, parallel subagents, logging, accessibility, TypeScript, CHANGELOG |

> `orchestration-rules` is loaded automatically on every project and every task.
> It does not need to be invoked — it is always active.

## Agents

| Agent | Description |
|-------|-------------|
| `feature-prompt-builder-quick` | Builds a prompt for a small feature described in plain text |
| `feature-prompt-builder-spec` | Builds a prompt for a large feature with a full spec |
| `qa-checker` | Runs QA checks: typecheck, build, console artifacts, accessibility, CHANGELOG |
| `pr-finalizer` | Updates CHANGELOG, opens PR to main with structured description |
| `project-orienteer` | Scans existing project, produces context block for Claude Code |
| `background-enforcer` | Enforces all skill conventions on changed files — fixes directly |

## Commands

| Command | Description |
|---------|-------------|
| `/quick-feature` | Invoke feature-prompt-builder-quick |
| `/spec-feature` | Invoke feature-prompt-builder-spec |
| `/qa` | Run QA checks before PR |
| `/done` | Finalize and open PR to main |
| `/orient` | Scan project and produce context block |
| `/enforce` | Enforce all skill conventions on changed files |
| `/new-project-flow` | Full flow for new projects |
| `/continue-project-flow` | Full flow for existing projects + new feature |

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

## Full workflow

### New project — full flow
```
/new-project-flow
[Claude Code builds]
Done — PR opened automatically.
```

### Existing project — full flow
```
/continue-project-flow
[Claude Code builds]
Done — PR opened automatically.
```

### Manual step-by-step (if you prefer control)
```
/orient              → get context block → paste into Claude Code prompt
[Claude Code builds]
/enforce             → fix all conventions
/qa                  → typecheck, build, artifacts check
/check-logs-a11y     → deep logging + RTL scan  ⚠ agent not yet built
/done                → open PR
```
