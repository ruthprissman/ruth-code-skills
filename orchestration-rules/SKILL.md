---
name: orchestration-rules
description: How Claude Code must work on every project — always loaded globally. Defines prompt decomposition, parallel subagent execution, and background enforcement rules. Never needs to be invoked manually — always active.
version: 1.0.0
user-invocable: false
---

# Orchestration Rules — Always Active

These rules apply to EVERY task in EVERY project.
You do not need to be told to follow them. They are always on.

---

## Rule 1 — Read before touching anything

Before writing a single line of code:
1. Read CLAUDE.md at the project root
2. Read the directory structure (2 levels): find . -not -path '*/node_modules/*' -not -path '*/.git/*' -maxdepth 2
3. Read any file your task will touch or depend on

If CLAUDE.md does not exist — stop and tell the user before proceeding.

---

## Rule 2 — Decompose long prompts into parallel subagents

When a prompt contains 3 or more independent Parts:
1. Identify which Parts are truly independent (no shared files, no dependency between them)
2. For each independent Part — spawn a subagent on a separate branch: feature/[task-name]-part-[N]
3. Run independent subagents in parallel
4. Parts that depend on earlier Parts run after those finish
5. Each subagent must run npm run typecheck before reporting done
6. After all subagents finish — report a summary of what each one did

When Parts are sequential (each depends on the previous):
- Run them in order, not in parallel
- Do not start Part N+1 until Part N passes typecheck

---

## Rule 3 — Logging is not optional

Check CLAUDE.md to confirm if this project uses supabase-logging.
If yes — every time you write code that does any of the following, add log_event() immediately:

| Code action | Required log |
|-------------|-------------|
| Supabase insert / update / delete / upsert | log_event after the call |
| catch block | log_event with severity 'error' and the error message |
| signIn / signOut / signUp | log_event with event type 'user_login' / 'user_logout' |
| Edge Function entry point | log_event at the start |
| Edge Function error | log_event in the catch |

Use the exact log_event() signature already in use in this project.
Read src/lib/ or src/utils/ to find it before writing any log call.
If log_event is not imported in the file you are editing — add the import.

Do not add logging to: read-only queries, UI event handlers, utility functions with no side effects.

---

## Rule 4 — Accessibility is not optional (Hebrew RTL projects)

Check CLAUDE.md for language. If the project is Hebrew RTL — every component you write or modify must:

Images:
- Every <img> must have alt=""  (decorative) or alt="meaningful description"
- Never omit alt

Buttons and icons:
- Every <button> that contains only an icon (no visible text) must have aria-label
- Every icon-only <a> must have aria-label

Forms:
- Every <input> must have an associated <label> or aria-label
- Every <select> must have an associated <label> or aria-label
- Every <textarea> must have an associated <label> or aria-label

Interactive elements:
- Never put onClick on <div> or <span> without also adding role="button" and tabIndex={0}
- Modals and dialogs must have role="dialog" and aria-labelledby pointing to the title

RTL:
- Never use margin-left, padding-left, text-align: left in RTL context
  Use margin-start, padding-start, text-align: start instead
- Never wrap Hebrew text in a container with dir="ltr" accidentally
- Numeric values (dates, prices, IDs) inside Hebrew text need dir="rtl" or bidi-isolate

---

## Rule 5 — TypeScript conventions

- Never use `any` type without a comment: // TODO: type this — [reason]
- Never re-instantiate the Supabase client — import it from the project's existing client file
- Never leave console.log in committed code — use log_event() if logging exists, remove otherwise
- Always run npm run typecheck before reporting a task as done

---

## Rule 6 — Every PR must include CHANGELOG.md

Before opening any PR to main:
1. Open CHANGELOG.md
2. Under [Unreleased] — add bullet points describing what changed
3. Language: Hebrew, user-facing (not technical)
   Good: "נוספה אפשרות ייצוא לאקסל בדף הדוחות"
   Bad: "Added xlsx export handler to ReportsPage.tsx"
4. If [Unreleased] section does not exist — create it

---

## Rule 7 — Branch naming

| Type | Branch name |
|------|-------------|
| New feature | feature/[short-name] |
| Bug fix | fix/[short-name] |
| Maintenance | chore/[short-name] |
| Parallel subagent | feature/[task]-part-[N] |

---

## Rule 8 — What NOT to do

- Do not modify files outside the scope of the current task
- Do not change existing working functionality to "improve" it unless asked
- Do not add dependencies (npm packages) without asking first
- Do not change the Supabase client instantiation pattern
- Do not remove existing log_event() calls
- Do not merge branches — open PR and stop

---

## Summary — before marking any task done

Ask yourself:
- [ ] Did I read CLAUDE.md and existing files before writing?
- [ ] Did I use parallel subagents for independent Parts?
- [ ] Did I add log_event() everywhere required?
- [ ] Did I add aria-label, alt, labels everywhere required?
- [ ] Did I run npm run typecheck — zero errors?
- [ ] Did I update CHANGELOG.md?
- [ ] Is the PR open and waiting?

If any box is unchecked — go back and fix it before reporting done.
