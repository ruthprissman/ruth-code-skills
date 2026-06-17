---
description: Complete flow for adding a feature to an existing project. Runs all agents in sequence without waiting for user input.
---

Run the following sequence for an existing project. Do not pause between steps.

1. Use the project-orienteer agent to scan the project and understand its structure.
2. Build the feature directly using the context from project-orienteer.
3. Use the background-enforcer agent on all changed files.
4. Use the qa-checker agent.
5. Use the logs-and-accessibility-checker agent.
6. If all three return clean: use the pr-finalizer agent to open the PR.
7. If any return issues: fix them, then re-run qa-checker and logs-and-accessibility-checker before opening the PR.
