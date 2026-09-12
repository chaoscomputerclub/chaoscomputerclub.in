# Chaos Computer Club Repository Guidelines

## 1. Deployment & Version Control Rules

### STRICT RULE: NEVER USE RSYNC FOR DEPLOYMENTS OR FILE TRANSFERS
- **DO NOT** use `rsync` or direct SSH file copying to deploy files, source code, or build artifacts to remote servers or VPS.
- **Why**: Direct file transfers bypass version control, destroy historical lineage, and make tracking down regressions or past modifications impossible.
- **Required Workflow**:
  1. Commit all changes locally with descriptive Git commit messages.
  2. Push all commits to GitHub (`origin main`).
  3. Deploy on the remote VPS strictly via `git pull origin main` followed by on-server build (`npm run build`) and process restarts (`pm2 restart`).

## 2. Architecture & State Management Standards

- **State Management**: Use Redux Toolkit (`@reduxjs/toolkit` and `react-redux`) strictly for all global state (auth, portal filters, UI drawers). No fragmented local `useState` for cross-component or session data.
- **Backend & Database**: Python FastAPI with SQLAlchemy 2.0 async ORM (`postgresql+asyncpg` on production, `sqlite+aiosqlite` for local dev). Supabase is permanently decommissioned.
