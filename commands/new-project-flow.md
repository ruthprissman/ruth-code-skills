---
description: Complete flow for a new project. Runs all agents in sequence without waiting for user input.
---

Run the following sequence for a new project. Do not pause between steps.

1. Confirm CLAUDE.md exists at project root. If not — stop and ask the user to create it.
2. Use the project-orienteer agent to scan the project and understand its structure.
3. Build the feature directly using the context from project-orienteer.
4. Use the background-enforcer agent on all changed files.
5. Use the qa-checker agent.
6. Use the logs-and-accessibility-checker agent.
7. If all three return clean: use the pr-finalizer agent to open the PR.
8. If any return issues: fix them, then re-run qa-checker and logs-and-accessibility-checker before opening the PR.
