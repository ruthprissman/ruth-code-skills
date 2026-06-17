---
description: Complete flow for adding a feature to an existing project. Orient first, enforce after.
---

Run the following sequence for an existing project:

1. Use the project-orienteer agent to scan this project and produce a context block.
2. Tell the user: "Paste this context block at the top of your feature prompt, then run Claude Code."
3. After the user confirms Claude Code has finished building, run:
   - background-enforcer agent
   - qa-checker agent
   - logs-and-accessibility-checker agent
4. If both return clean: use the pr-finalizer agent to open the PR.
5. If either returns issues: list them and wait for the user to fix, then re-run /qa.
