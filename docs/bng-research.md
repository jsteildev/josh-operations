# BNG x TCB Engagement — Patterns Adopted

Last verified: 2026-10-09. Source: Jimmy Kelly / By Nature Group email threads and Fireflies recaps, summer 2026 (researched read-only from Josh's work Gmail).

## The engagement

By Nature Group (BNG, bynaturegroup.com), Jimmy Kelly (James Kelly), Founder. Started late April 2026 with 1:1 Claude Coaching Sessions, formalized June 6, 2026 with an "AI & Systems Partner Agreement" (SOW ref `BDCR1-AISP2-2026-0606`): $5,750/month, month-to-month, weekly sprints, Josh/Chris own everything built. A second SOW (Jul 23) covered fulfillment systems.

## Patterns adopted in this repo

| BNG / TCB pattern | This repo's version |
|---|---|
| Repo `The-Credit-Brothers/tcb-operations` | `jsteildev/josh-operations` (personal) |
| `workers/operations/` — all automation code | Same path, same purpose |
| `config/workflows.json` — every automation registered as `WF-*` | Same file, same `WF-NN` scheme |
| `CLAUDE.md` repo constitution: catalog entry updated **in the same PR** as any workflow change | Same rule in `CLAUDE.md` |
| CI bot reminding on catalog drift | `scripts/validate-workflows.py` (run manually for now) |
| Versioned releases per merge (`v1.049` → `v1.394+`) | Lighter: version tags on deploy-worthy changes |
| `docs/` with conventional-commit docs PRs and periodic sweeps | `docs/` with owner + last-verified dates |
| SOW format: What We Heard → How We Work → How We Deliver → Investment → Next Steps → Approval | Reuse for any future build partnerships |
| Weekly sync ritual ("TCB <> BNG Sync") | Weekly ops check-in (to be scheduled) |
| Principles: Eliminate before automating; Lean by design; Data integrity; Transparency first | Adopted verbatim in `CLAUDE.md` |

## Deliberately lighter than TCB

- No multi-deploy-per-day release train; personal scale doesn't need it.
- No CI bot yet; the validate script runs by hand until the repo is on GitHub with Actions.
- Apps live in `apps/` inside this repo (personal scale), rather than sibling repos.
