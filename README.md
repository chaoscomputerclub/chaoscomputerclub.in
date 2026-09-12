# Chaos Computer Club India

This workspace contains two independent standalone frontend projects:

1. **`Root/`** (`chaoscomputerclub.in`)
   - The parent portfolio and platform for Chaos Computer Club India.
   - Built with TanStack Start, React 19, Tailwind CSS, Framer Motion, and OGL/Three.js.
   - Port: `8080` (or `3000`)
   - Run locally:
     ```bash
     cd Root
     npm run dev
     ```

2. **`Medicaps/`** (`medicaps.chaoscomputerclub.in`)
   - The Medi-Caps University Chapter Member Portal.
   - Built with TanStack Router, TanStack Query, React 19, and Tailwind CSS.
   - Features: Member Dashboard, Problem Archives, Offline Contests, Event RSVPs, Leaderboards, and Member Profiles.
   - Port: `8081`
   - Run locally:
     ```bash
     cd Medicaps
     npm run dev
     ```

---

### Quick Scripts (from root directory)

```bash
# Run Root (chaoscomputerclub.in)
npm run dev:root

# Run Medicaps (medicaps.chaoscomputerclub.in)
npm run dev:medicaps

# Build both projects
npm run build
```
