---
description: Complete flow for a new project. Runs skills and enforcement in sequence.
---

Run the following sequence for a new project:

1. Confirm CLAUDE.md exists at project root. If not — stop and ask the user to create it.
2. Use the project-orienteer agent to scan the project and produce a context block.
3. Tell the user: "Paste this context block at the top of your feature prompt, then run Claude Code."
4. After the user confirms Claude Code has finished building, run:
   - background-enforcer agent
   - qa-checker agent
   - logs-and-accessibility-checker agent
5. If both return clean: use the pr-finalizer agent to open the PR.
6. If either returns issues: list them and wait for the user to fix, then re-run /qa.
