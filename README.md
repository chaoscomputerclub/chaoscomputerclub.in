# Chaos Computer Club India (`chaoscomputerclub.in`)

> **Learn. Compete. Build. Connect.**  
> India's offline competitive tech community for college students — inspired by [CCC Germany](https://www.ccc.de/).

---

## 🏛️ Ecosystem Architecture

```
chaoscomputerclub.in/
├── root/                                    ← Parent portfolio & platform (chaoscomputerclub.in)
└── organization/                            ← Registered university chapters
    └── Medicaps.chaoscomputerclub.in/       ← Medi-Caps University Chapter Member Portal
```

---

## 🚀 Running the Apps

```bash
# Run the parent platform (root) on http://localhost:8080
npm run dev:root

# Run Medi-Caps Chapter portal on http://localhost:8081
npm run dev:medicaps

# Build both applications
npm run build:all
```

---

## 🌐 External Repositories

- **Root Platform**: [`chaoscomputerclub/chaoscomputerclub.in`](https://github.com/chaoscomputerclub/chaoscomputerclub.in)
- **Medi-Caps Chapter Portal**: [`chaoscomputerclub/medicaps.chaoscomputerclub.in`](https://github.com/chaoscomputerclub/medicaps.chaoscomputerclub.in)
