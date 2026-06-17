# ruth-code-skills

A collection of Claude Code skills for building client projects with Supabase + React + Vercel.

## Skills

| Skill | Description |
|-------|-------------|
| `client-project-init` | Master checklist for starting a new client project — invokes all other skills in order |
| `supabase-logging` | Adds a `system_logs` table + `log_event()` function + `/admin/logs` page |
| `supabase-drive-backup` | Daily automated backup to Google Drive (Excel + pg_dump) |
| `legal-pages-israel` | Privacy Policy + Terms of Service for Israeli internal sites |
| `project-about-page` | Public `/about` page for closed apps (Google OAuth + SEO) |

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

Skills are copied to `~/.claude/skills/` and are immediately available in Claude Code.

## Usage

Start any new client project with:
```
/client-project-init
```

Or invoke individual skills as needed:
```
/supabase-logging
/supabase-drive-backup
/legal-pages-israel
/project-about-page
```
