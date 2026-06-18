# Snowkap Monorepo — Copilot Instructions

pnpm workspace with two active apps: `apps/web` (Next.js 15) and `apps/hasura` (Hasura metadata and migrations). Use [CLAUDE.md](../CLAUDE.md) for architecture, security, and stack details; keep this file focused on agent-critical behavior.

## Shared Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

- Root scripts fan out across workspaces.
- There are no automated tests configured today, so `pnpm test` is not a useful validation target; prefer the narrowest relevant `lint`, `build`, or `codegen` check instead.
- Node and pnpm are pinned via Volta: Node 20.10.0 and pnpm 10.11.0.

## Repo-Wide Conventions

- Prefer the scoped instruction files under `.github/instructions/` when working in `apps/web` or `apps/hasura`; they contain the monorepo-specific rules that should not always be loaded.
- Link to existing docs instead of copying them into new customization files. The main references are [CLAUDE.md](../CLAUDE.md) and the feature specs under `specs/`.
- Do not assume the legacy Pages Router, `next-auth`, or ad hoc SQL access are the default paths. Check the scoped instructions before adding new work in those areas.

## Existing Custom Agent

- `.github/agents/gem-designer.agent.md` is a design-only subagent for UI and design-system work. Use it for design specs and validation, not for code implementation.
