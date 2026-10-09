# Josh Operations

Personal operations repo for Josh Steil. Apps, workflows, automations, and docs for his personal life, modeled on the operations-folder patterns By Nature Group set up for The Credit Brothers (see `docs/bng-research.md`).

## Layout

- `apps/` — deployable apps (personal website, photo swipe)
- `workers/operations/` — automation and worker code
- `config/workflows.json` — the workflow catalog, the single source of truth for every automation
- `scripts/` — repo tooling (catalog validation)
- `docs/` — docs with a managed lifecycle

## The one rule

Any new or changed workflow or automation must update its `WF-*` catalog entry in `config/workflows.json` **in the same change**. See `CLAUDE.md`.

## Workflows

| ID | Name | Status |
|----|------|--------|
| WF-01 | Weekly iCloud photo curation | Proposed |
| WF-02 | Personal website deploy (Vercel) | In progress |
| WF-03 | Photo swipe batch pipeline | In progress |
