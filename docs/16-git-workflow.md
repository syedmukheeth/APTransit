# 16 · Git workflow and daily rhythm

**Status: LOCKED.**

## Branches

- `main` is always deployable. Protected: PR required, 1 approval, CI green.
- Dev A: `a/<topic>` (for example `a/seat-map`). Dev B: `b/<topic>` (for example `b/seat-hold`).
- Short lived: open the PR the same day. Rebase on `main` before merge. Squash merge.
- Contract changes (`packages/shared`) go in their own small PR first, merged before the code that uses them.

## Commits

- Title only by default. Imperative, under 60 characters, no trailing period: `Add seat hold with Redis TTL`.
- Optional body only when the reason is not obvious. 1 or 2 short lines.
- Never any `Co-authored-by`, `Generated-by`, `AI-assisted` or similar line. Check before every commit:

```bash
git log -1 --format=%B | grep -iE "co-authored-by|generated|ai-assisted|claude|copilot|chatgpt|gemini|cursor" && echo "REMOVE ATTRIBUTION" || echo "clean"
```

- If a tool adds trailers, turn it off in that tool. Do not add git hooks.
- No `--no-verify`, no force push to `main`.

## Pull requests

Title same style as commits. Description template (`.github/pull_request_template.md`, created on Day 1):

```markdown
## What
One or two lines.

## Screens (UI changes)
Before and after at 360 and 1280 px.

## Checklist
- [ ] pnpm lint, typecheck, test pass
- [ ] No em dash or en dash (pnpm check:dashes)
- [ ] en.json and te.json both updated
- [ ] Loading, empty, error states done
- [ ] Docs unchanged, or decision logged
```

Review within 2 hours during the day. Reviewer runs the branch locally for UI PRs.

## Daily rhythm (both devs)

| Time | What |
| --- | --- |
| Start | Pull `main`. Read today's `prompts/day-NN.md`. Paste `_shared/context-preamble.md`, then your prompt, into your AI tool |
| Start + 10 min | 10 minute call: confirm today's contract (endpoints, shapes), blockers from yesterday |
| Midday | Push a draft PR so the other dev can see progress |
| End minus 30 min | Sync point (see day file): demo to each other, merge order, contract changes |
| End | Merge. Each dev appends the end of day report to `progress/daily-log.md` |

## Merge order when both touch `packages/shared`

Dev B merges schema and contract first, Dev A rebases. If Dev A needs a shape before Dev B's endpoint exists, Dev A adds the zod schema in a tiny PR and Dev B implements against it.

## Releases

- Day 10 and Day 19: tag `v0.1.0` and `v0.2.0` on `main` after the staging smoke test passes.
- Day 20: `v1.0.0-demo`.
