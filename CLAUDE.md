# CLAUDE.md — Repo Constitution

This is the law of the `josh-operations` repo. Follow it on every change.

## 1. Workflow Catalog (the core rule)

`config/workflows.json` is the single source of truth for every automation and recurring workflow in this repo.

- Every workflow gets a `WF-*` ID (WF-01, WF-02, ...). Never reuse an ID.
- **Any change to a workflow or automation must update its `WF-*` catalog entry in the same change.** New workflow, changed schedule, changed behavior: the catalog entry moves with the code. No exceptions.
- `scripts/validate-workflows.py` checks the catalog stays valid. Run it before finishing a workflow change.

## 2. Naming

- Repos, folders, files: `kebab-case`, always.
- Workflow IDs: `WF-NN`, zero-padded, sequential.
- Docs: `docs/<topic>.md`, kebab-case. Major revisions get a date suffix only when keeping history matters.

## 3. Release discipline

- Meaningful changes get a version tag (`v0.1`, `v0.2`, ...). Tag on deploy-worthy changes, not every commit.
- Commit messages: conventional style (`feat:`, `fix:`, `docs:`, `chore:`), plain English after the colon.

## 4. Docs lifecycle

- Every doc has an owner (Josh or Muse) and a "last verified" date at the top.
- Stale docs get a sweep pass, not silent rot. If it's wrong, fix it or delete it.

## 5. Principles (from the BNG engagement)

- Eliminate before automating.
- Lean by design.
- Data integrity first.
- Transparency first: Josh can always see what an automation did and why.
