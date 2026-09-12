# Chaos Computer Club India (`chaoscomputerclub.in`)

> **Learn. Compete. Build. Connect.**  
> India's offline competitive tech community for college students — inspired by [CCC Germany](https://www.ccc.de/).

---

## 🏛️ Project Overview

`chaoscomputerclub.in` is the parent portfolio platform for Chaos Computer Club India. It coordinates university chapters, technical events, offline DSA contests, hackathons, and student developer initiatives across campuses.

### 🌐 Subdomain Architecture

```
chaoscomputerclub.in                  ← Parent portfolio & platform
│
├── medicaps.chaoscomputerclub.in     ← Medi-Caps University Chapter
├── ips.chaoscomputerclub.in          ← IPS Academy Chapter
├── sgsits.chaoscomputerclub.in       ← SGSITS Indore Chapter
└── [org].chaoscomputerclub.in        ← Registered university chapters
```

---

## 📁 Repository Structure

```
chaoscomputerclub.in/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS frontend
├── backend/              # FastAPI Python backend service
├── AGENTS.md             # Design system & architecture guidelines
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

Backend runs at `http://localhost:8000` (API docs at `/docs`).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 📜 License

Private & Proprietary © Chaos Computer Club India.
