---
name: Run lint after changes
description: Always run npm run lint:fix after updating code or documentation files
type: feedback
---

Run `npm run lint:fix` after updating code or wiki/doc pages to reformat with Prettier.

**Why:** Project enforces Prettier formatting. CI checks it.
**How to apply:** Run after any edit session, before reporting done.
