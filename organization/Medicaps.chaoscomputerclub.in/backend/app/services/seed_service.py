"""
Chaos Computer Club India — Medi-Caps Chapter Backend
Seed Service: Pre-populates the database with realistic Medi-Caps offline contest data
"""

import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash
from app.models.db_models import (
    Announcement,
    Assessment,
    AssessmentProblem,
    CampusPass,
    ContestProblem,
    MemberProfile,
    OfflineContest,
    RatingHistory,
    ScoreboardEntry,
    TrustProof,
)
from app.services.proof_service import create_trust_proof_data, generate_certificate_id


async def seed_database(db: AsyncSession):
    """Seed initial offline contests, members, scoreboards, and proofs if empty."""
    now = datetime.now(timezone.utc)

    # 1. Contests & members check
    existing_contest = await db.execute(select(OfflineContest).limit(1))
    if not existing_contest.scalars().first():
        await _seed_contests_and_members(db, now)

    # 2. Assessment check
    await _seed_assessment(db, now)


async def _seed_contests_and_members(db: AsyncSession, now: datetime):
    # 1. Members
    members_data = [
        {
            "id": str(uuid.uuid4()),
            "handle": "arjun_v",
            "full_name": "Arjun Varma",
            "email": "arjun.varma@medicaps.ac.in",
            "prn": "0827CS231042",
            "department": "CSE",
            "batch": "2023-27",
            "rating": 1894,
            "peak_rating": 1940,
            "attendance_count": 9,
            "attendance_total": 10,
            "is_core_member": True,
        },
        {
            "id": str(uuid.uuid4()),
            "handle": "riya_k",
            "full_name": "Riya Kulkarni",
            "email": "riya.k@medicaps.ac.in",
            "prn": "0827IT231089",
            "department": "IT",
            "batch": "2023-27",
            "rating": 1782,
            "peak_rating": 1810,
            "attendance_count": 8,
            "attendance_total": 10,
            "is_core_member": True,
        },
        {
            "id": str(uuid.uuid4()),
            "handle": "tanmay_s",
            "full_name": "Tanmay Sharma",
            "email": "tanmay.s@medicaps.ac.in",
            "prn": "0827CS221015",
            "department": "CSE",
            "batch": "2022-26",
            "rating": 1945,
            "peak_rating": 2010,
            "attendance_count": 10,
            "attendance_total": 10,
            "is_core_member": False,
        },
        {
            "id": str(uuid.uuid4()),
            "handle": "neha_p",
            "full_name": "Neha Patel",
            "email": "neha.p@medicaps.ac.in",
            "prn": "0827AI231024",
            "department": "AIDS",
            "batch": "2023-27",
            "rating": 1650,
            "peak_rating": 1690,
            "attendance_count": 7,
            "attendance_total": 10,
            "is_core_member": False,
        },
        {
            "id": str(uuid.uuid4()),
            "handle": "kabir_m",
            "full_name": "Kabir Mehta",
            "email": "kabir.m@medicaps.ac.in",
            "prn": "0827CY241008",
            "department": "Cyber Security",
            "batch": "2024-28",
            "rating": 1540,
            "peak_rating": 1580,
            "attendance_count": 5,
            "attendance_total": 6,
            "is_core_member": False,
        },
    ]

    members_map = {}
    for m in members_data:
        profile = MemberProfile(
            id=m["id"],
            handle=m["handle"],
            full_name=m["full_name"],
            email=m["email"],
            prn=m["prn"],
            department=m["department"],
            batch=m["batch"],
            rating=m["rating"],
            peak_rating=m["peak_rating"],
            attendance_count=m["attendance_count"],
            attendance_total=m["attendance_total"],
            is_core_member=m["is_core_member"],
            hashed_password=get_password_hash("password123"),
            is_onboarded=True,
            created_at=now - timedelta(days=90),
        )
        db.add(profile)
        members_map[m["handle"]] = profile

    # 2. Contests
    c1_id = str(uuid.uuid4())
    c2_id = str(uuid.uuid4())
    c3_id = str(uuid.uuid4())

    contests = [
        OfflineContest(
            id=c1_id,
            slug="chaos-arena-2026",
            title="Chaos Arena: Season 02",
            season="Season 2026",
            status="finished",
            division="division_1",
            starts_at=now - timedelta(days=7),
            ends_at=now - timedelta(days=7, hours=-3),
            check_in_opens_at=now - timedelta(days=7, minutes=45),
            venue="Lab 304, Computer Science Block",
            seat_capacity=120,
            registered_count=118,
            problem_count=6,
            environment="Air-gapped LAN, GCC 14.2 / Clang 18 / Python 3.12, Offline Docs Only",
            chief_proctors=["Dr. S. K. Dubey", "Prof. Animesh Joshi (HOD CSE)"],
            prize_pool="₹15,000 + CCC Division 1 Honors",
            sponsor="Chaos Computer Club Chapter Grant",
            summary="Flagship offline algorithmic competition for Division 1 competitors across Medi-Caps University.",
            rules=[
                "Zero external internet access. Network is strictly isolated to the contest jury server.",
                "Students must present physical University ID card & digital CCC Campus Pass at the lab gate.",
                "Submissions evaluated against 100 test cases with strict 1.0s / 256MB constraints.",
                "Penalty is 20 minutes per incorrect verdict before Accepted.",
            ],
            created_at=now - timedelta(days=20),
        ),
        OfflineContest(
            id=c2_id,
            slug="winter-algothon-2026",
            title="Winter Algothon: On-Premise LAN Battle",
            season="Season 2026",
            status="upcoming",
            division="open",
            starts_at=now + timedelta(days=3, hours=4),
            ends_at=now + timedelta(days=3, hours=7),
            check_in_opens_at=now + timedelta(days=3, hours=3, minutes=15),
            venue="Auditorium Main Hall & CS Labs 401-404",
            seat_capacity=200,
            registered_count=164,
            problem_count=6,
            environment="Air-gapped LAN, Single workstation per contestant, Proctor surveillance",
            chief_proctors=["Prof. R. C. Sharma", "Dr. Meenal Gupta"],
            prize_pool="₹25,000 + Sponsored Hardware Kits",
            sponsor="Medi-Caps University Research Cell",
            summary="All-campus open offline hack battle. Simultaneous 200-station LAN contest.",
            rules=[
                "Open to all batches (2022 to 2025). Division split applied to scoreboard rankings.",
                "Gate passes close strictly 15 minutes before contest start.",
                "Hardware keyboards allowed subject to physical inspection at the checkpoint.",
            ],
            created_at=now - timedelta(days=5),
        ),
        OfflineContest(
            id=c3_id,
            slug="fresher-induction-2026",
            title="Fresher Induction Sprint '26",
            season="Season 2026",
            status="finished",
            division="division_3",
            starts_at=now - timedelta(days=21),
            ends_at=now - timedelta(days=21, hours=-2),
            check_in_opens_at=now - timedelta(days=21, minutes=30),
            venue="Lab 102 & 104, IT Block",
            seat_capacity=80,
            registered_count=78,
            problem_count=4,
            environment="Offline LAN Server, Starter IDEs preloaded",
            chief_proctors=["Prof. K. Verma"],
            prize_pool="CCC Welcome Kits & Div 2 Upgrades",
            sponsor="Medi-Caps CCC Student Chapter",
            summary="Induction sprint for 1st and 2nd year students testing foundational DSA and problem decomposition.",
            rules=[
                "Problems strictly focus on linear structures, binary search, and math.",
                "Proctors verify physical lab attendance with paper signatures.",
            ],
            created_at=now - timedelta(days=35),
        ),
    ]

    for c in contests:
        db.add(c)

    # 3. Contest Problems for Chaos Arena 2026
    c1_problems = [
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="A",
            title="Subarray Parity Balance",
            topic="Prefix Sums & Hashing",
            points=100,
            solved_count=98,
            first_ac_seconds=340,  # 5m 40s
            editorial_summary="Compute prefix sum parity arrays and count matching indices in O(N).",
        ),
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="B",
            title="Campus Router Latency",
            topic="Shortest Path / Dijkstra",
            points=200,
            solved_count=74,
            first_ac_seconds=860,  # 14m 20s
            editorial_summary="Model campus buildings as a weighted DAG and find the minimax latency bottleneck.",
        ),
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="C",
            title="Optimal Lab Scheduling",
            topic="Interval Scheduling & Priority Queues",
            points=300,
            solved_count=51,
            first_ac_seconds=1420,  # 23m 40s
            editorial_summary="Sort intervals by deadline and use min-heap to allocate minimal lab rooms.",
        ),
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="D",
            title="Bitwise Matrix Inversion",
            topic="Bit Manipulation & Gaussian Elimination",
            points=400,
            solved_count=32,
            first_ac_seconds=2240,  # 37m 20s
            editorial_summary="Solve system of XOR equations over GF(2) using row reduction.",
        ),
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="E",
            title="Subtree Frequency Queries",
            topic="Tree Flattening & Segment Trees",
            points=500,
            solved_count=18,
            first_ac_seconds=3800,  # 1h 3m
            editorial_summary="Euler Tour tree flattening paired with Mo's algorithm or merge-sort trees.",
        ),
        ContestProblem(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            problem_index="F",
            title="Maximum Bipartite Matching with Quotas",
            topic="Flow Networks / Dinic's Algorithm",
            points=600,
            solved_count=6,
            first_ac_seconds=5700,  # 1h 35m
            editorial_summary="Construct circulation network with demands and compute max-flow via Dinic's.",
        ),
    ]

    for p in c1_problems:
        db.add(p)

    # 4. Scoreboard for Chaos Arena 2026
    c1_standings = [
        {
            "rank": 1,
            "handle": "tanmay_s",
            "full_name": "Tanmay Sharma",
            "department": "CSE",
            "batch": "2022-26",
            "division": "division_1",
            "score": 2100,
            "solved": 6,
            "penalty_seconds": 9420,
            "rating_delta": 92,
            "telemetry": [
                {"problem_index": "A", "status": "solved", "attempts": 1, "solve_minute": 7, "is_first_ac": False},
                {"problem_index": "B", "status": "solved", "attempts": 1, "solve_minute": 15, "is_first_ac": False},
                {"problem_index": "C", "status": "solved", "attempts": 1, "solve_minute": 24, "is_first_ac": True},
                {"problem_index": "D", "status": "solved", "attempts": 2, "solve_minute": 41, "is_first_ac": False},
                {"problem_index": "E", "status": "solved", "attempts": 1, "solve_minute": 64, "is_first_ac": False},
                {"problem_index": "F", "status": "solved", "attempts": 2, "solve_minute": 95, "is_first_ac": True},
            ],
        },
        {
            "rank": 2,
            "handle": "arjun_v",
            "full_name": "Arjun Varma",
            "department": "CSE",
            "batch": "2023-27",
            "division": "division_1",
            "score": 1500,
            "solved": 5,
            "penalty_seconds": 6840,
            "rating_delta": 74,
            "telemetry": [
                {"problem_index": "A", "status": "solved", "attempts": 1, "solve_minute": 5, "is_first_ac": True},
                {"problem_index": "B", "status": "solved", "attempts": 1, "solve_minute": 14, "is_first_ac": True},
                {"problem_index": "C", "status": "solved", "attempts": 1, "solve_minute": 28, "is_first_ac": False},
                {"problem_index": "D", "status": "solved", "attempts": 1, "solve_minute": 45, "is_first_ac": False},
                {"problem_index": "E", "status": "solved", "attempts": 2, "solve_minute": 76, "is_first_ac": False},
                {"problem_index": "F", "status": "failed", "attempts": 3, "solve_minute": None, "is_first_ac": False},
            ],
        },
        {
            "rank": 3,
            "handle": "riya_k",
            "full_name": "Riya Kulkarni",
            "department": "IT",
            "batch": "2023-27",
            "division": "division_1",
            "score": 1000,
            "solved": 4,
            "penalty_seconds": 5420,
            "rating_delta": 52,
            "telemetry": [
                {"problem_index": "A", "status": "solved", "attempts": 1, "solve_minute": 9, "is_first_ac": False},
                {"problem_index": "B", "status": "solved", "attempts": 2, "solve_minute": 22, "is_first_ac": False},
                {"problem_index": "C", "status": "solved", "attempts": 1, "solve_minute": 39, "is_first_ac": False},
                {"problem_index": "D", "status": "solved", "attempts": 1, "solve_minute": 58, "is_first_ac": False},
                {"problem_index": "E", "status": "failed", "attempts": 2, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "F", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
            ],
        },
        {
            "rank": 4,
            "handle": "neha_p",
            "full_name": "Neha Patel",
            "department": "AIDS",
            "batch": "2023-27",
            "division": "division_2",
            "score": 600,
            "solved": 3,
            "penalty_seconds": 3810,
            "rating_delta": 34,
            "telemetry": [
                {"problem_index": "A", "status": "solved", "attempts": 1, "solve_minute": 11, "is_first_ac": False},
                {"problem_index": "B", "status": "solved", "attempts": 1, "solve_minute": 26, "is_first_ac": False},
                {"problem_index": "C", "status": "solved", "attempts": 2, "solve_minute": 52, "is_first_ac": False},
                {"problem_index": "D", "status": "failed", "attempts": 2, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "E", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "F", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
            ],
        },
        {
            "rank": 5,
            "handle": "kabir_m",
            "full_name": "Kabir Mehta",
            "department": "Cyber Security",
            "batch": "2024-28",
            "division": "division_2",
            "score": 300,
            "solved": 2,
            "penalty_seconds": 2420,
            "rating_delta": 18,
            "telemetry": [
                {"problem_index": "A", "status": "solved", "attempts": 1, "solve_minute": 14, "is_first_ac": False},
                {"problem_index": "B", "status": "solved", "attempts": 3, "solve_minute": 48, "is_first_ac": False},
                {"problem_index": "C", "status": "failed", "attempts": 1, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "D", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "E", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
                {"problem_index": "F", "status": "untouched", "attempts": 0, "solve_minute": None, "is_first_ac": False},
            ],
        },
    ]

    for s in c1_standings:
        entry = ScoreboardEntry(
            id=str(uuid.uuid4()),
            contest_id=c1_id,
            member_id=members_map.get(s["handle"]).id if s["handle"] in members_map else None,
            rank=s["rank"],
            handle=s["handle"],
            full_name=s["full_name"],
            department=s["department"],
            batch=s["batch"],
            division=s["division"],
            score=s["score"],
            solved=s["solved"],
            penalty_seconds=s["penalty_seconds"],
            rating_delta=s["rating_delta"],
            telemetry=s["telemetry"],
        )
        db.add(entry)

    # 5. Trust Proofs
    cert_seq = 40
    for s in c1_standings:
        cert_seq += 1
        cert_id = generate_certificate_id(2026, cert_seq)
        session_id = str(uuid.uuid4())
        prn = members_map[s["handle"]].prn if s["handle"] in members_map else f"0827CS23{cert_seq:04d}"
        proof_dict = create_trust_proof_data(
            contest_id=c1_id,
            contest_title="Chaos Arena: Season 02",
            member_handle=s["handle"],
            prn=prn,
            rank=s["rank"],
            score=s["score"],
            session_uuid=session_id,
            proctor_name="Dr. S. K. Dubey & Prof. Animesh Joshi",
            lab_venue="Lab 304, CS Block",
            certificate_id=cert_id,
        )
        proof = TrustProof(
            id=str(uuid.uuid4()),
            certificate_id=proof_dict["certificate_id"],
            contest_id=proof_dict["contest_id"],
            member_id=members_map.get(s["handle"]).id if s["handle"] in members_map else None,
            member_handle=proof_dict["member_handle"],
            contest_title=proof_dict["contest_title"],
            session_uuid=proof_dict["session_uuid"],
            prn_hash=proof_dict["prn_hash"],
            sha256_digest=proof_dict["sha256_digest"],
            proctor_stamp=proof_dict["proctor_stamp"],
            attendance_stamp=proof_dict["attendance_stamp"],
            score=proof_dict["score"],
            rank=proof_dict["rank"],
            issued_at=now - timedelta(days=7),
            status="verified",
        )
        db.add(proof)

    # 6. Rating History for Arjun
    arjun_id = members_map["arjun_v"].id
    histories = [
        RatingHistory(
            id=str(uuid.uuid4()),
            member_id=arjun_id,
            contest_id=c3_id,
            contest_title="Fresher Induction Sprint '26",
            contested_at=now - timedelta(days=21),
            old_rating=1720,
            new_rating=1820,
            rank=1,
        ),
        RatingHistory(
            id=str(uuid.uuid4()),
            member_id=arjun_id,
            contest_id=c1_id,
            contest_title="Chaos Arena: Season 02",
            contested_at=now - timedelta(days=7),
            old_rating=1820,
            new_rating=1894,
            rank=2,
        ),
    ]
    for h in histories:
        db.add(h)

    # 7. Campus Pass for Arjun
    c_pass = CampusPass(
        id=str(uuid.uuid4()),
        member_id=arjun_id,
        contest_id=c2_id,
        pass_code="PASS-MED-2026-089",
        seat_number="Station B-14",
        qr_data="https://medicaps.chaoscomputerclub.in/verify/pass/PASS-MED-2026-089",
        check_in_status="issued",
        issued_at=now - timedelta(hours=12),
    )
    db.add(c_pass)

    # 8. Announcements
    announcements = [
        Announcement(
            id=str(uuid.uuid4()),
            kind="contest_release",
            title="Winter Algothon '26: Registrations & Seat Allotment Open",
            summary="Seats for the 200-station on-premise LAN battle in Main Auditorium & CS Labs 401-404 are now open. Verify your pass.",
            published_at=now - timedelta(days=1),
            contest_slug="winter-algothon-2026",
        ),
        Announcement(
            id=str(uuid.uuid4()),
            kind="editorial",
            title="Editorial: Problem F - Bipartite Matching with Quotas",
            summary="Detailed breakdown of Dinic's max-flow circulation network algorithm used in Problem F of Chaos Arena Season 02.",
            published_at=now - timedelta(days=6),
            contest_slug="chaos-arena-2026",
        ),
        Announcement(
            id=str(uuid.uuid4()),
            kind="podium",
            title="Official Standings: Chaos Arena Season 02 Verified",
            summary="All 118 contest papers and jury logs cryptographically sealed. Digital Trust-of-Proof certificates issued with SHA-256 signatures.",
            published_at=now - timedelta(days=7),
            contest_slug="chaos-arena-2026",
        ),
    ]
    for a in announcements:
        db.add(a)

    await db.commit()
    print("✓ CCC Medi-Caps Contests and Members seeded.")


async def _seed_assessment(db: AsyncSession, now: datetime):
    # 9. Phase 1 Online Screening Assessment
    existing_assessment = await db.execute(select(Assessment).where(Assessment.slug == "chaos-arena-2026"))
    if not existing_assessment.scalars().first():
        assessment = Assessment(
            id=str(uuid.uuid4()),
            slug="chaos-arena-2026",
            title="Chaos Arena '26 — Phase 1 Online Screening",
            summary="Official Phase 1 online screening round. Top 30 qualifiers receive digital campus access QR passes for the physical lab final.",
            duration_minutes=90,
            starts_at=now - timedelta(days=2),
            ends_at=now + timedelta(days=14),
            is_active=True,
            max_violations=3,
        )
        db.add(assessment)
        await db.flush()

        prob_a = AssessmentProblem(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            problem_index="A",
            title="Two-Value Target Match",
            difficulty="EASY",
            points=100,
            time_limit=2.0,
            memory_limit=256,
            description="Given an array of integers `nums` and an integer `target`, find two distinct indices `i` and `j` such that `nums[i] + nums[j] == target`. Print the two indices in increasing order separated by space.",
            input_format="First line: N and target. Second line: N space-separated integers.",
            output_format="Print two space-separated indices.",
            constraints="2 <= N <= 10^5, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
            starter_codes={
                "python": "import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n, target = int(lines[0]), int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    seen = {}\n    for i, x in enumerate(nums):\n        rem = target - x\n        if rem in seen:\n            print(f\"{seen[rem]} {i}\")\n            return\n        seen[x] = i\n\nif __name__ == '__main__':\n    solve()\n",
                "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n; long long target;\n    if (!(cin >> n >> target)) return 0;\n    unordered_map<long long, int> seen;\n    for (int i = 0; i < n; i++) {\n        long long x; cin >> x;\n        long long rem = target - x;\n        if (seen.count(rem)) { cout << seen[rem] << \" \" << i << \"\\n\"; return 0; }\n        seen[x] = i;\n    }\n    return 0;\n}\n",
                "javascript": "const fs = require('fs');\nconst tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);\nif (tokens.length >= 2) {\n    const n = tokens[0], target = tokens[1];\n    const seen = new Map();\n    for (let i = 0; i < n; i++) {\n        const val = tokens[2 + i];\n        const rem = target - val;\n        if (seen.has(rem)) { console.log(seen.get(rem) + ' ' + i); process.exit(0); }\n        seen.set(val, i);\n    }\n}\n"
            },
            sample_testcases=[
                {"stdin": "4 9\n2 7 11 15", "expected_output": "0 1", "explanation": "nums[0] + nums[1] == 2 + 7 == 9"},
                {"stdin": "3 6\n3 2 4", "expected_output": "1 2", "explanation": "nums[1] + nums[2] == 2 + 4 == 6"}
            ],
            hidden_testcases=[
                {"stdin": "2 6\n3 3", "expected_output": "0 1", "weight": 25.0},
                {"stdin": "5 100\n10 20 30 70 80", "expected_output": "2 3", "weight": 25.0},
                {"stdin": "5 0\n-5 1 2 3 5", "expected_output": "0 4", "weight": 25.0},
                {"stdin": "4 -8\n-10 -3 -5 2", "expected_output": "1 2", "weight": 25.0}
            ]
        )
        db.add(prob_a)

        prob_b = AssessmentProblem(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            problem_index="B",
            title="Bitwise XOR Subarray Count",
            difficulty="MEDIUM",
            points=200,
            time_limit=2.0,
            memory_limit=256,
            description="Given an array of integers `A` of size `N` and an integer `B`, count the total number of contiguous subarrays having bitwise XOR equal to `B`.",
            input_format="First line: N and B. Second line: N space-separated integers.",
            output_format="Print a single integer representing the count of subarrays.",
            constraints="1 <= N <= 10^5, 0 <= B <= 10^9, 0 <= A[i] <= 10^9",
            starter_codes={
                "python": "import sys\nfrom collections import defaultdict\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n, b = int(lines[0]), int(lines[1])\n    arr = [int(x) for x in lines[2:2+n]]\n    pref = 0\n    count = 0\n    freq = defaultdict(int)\n    freq[0] = 1\n    for x in arr:\n        pref ^= x\n        count += freq[pref ^ b]\n        freq[pref] += 1\n    print(count)\n\nif __name__ == '__main__':\n    solve()\n",
                "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n; long long b;\n    if (!(cin >> n >> b)) return 0;\n    long long pref = 0, count = 0;\n    unordered_map<long long, int> freq;\n    freq[0] = 1;\n    for (int i = 0; i < n; i++) {\n        long long x; cin >> x;\n        pref ^= x;\n        if (freq.count(pref ^ b)) count += freq[pref ^ b];\n        freq[pref]++;\n    }\n    cout << count << endl;\n    return 0;\n}\n",
                "javascript": "const fs = require('fs');\nconst tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);\nif (tokens.length >= 2) {\n    const n = tokens[0], b = tokens[1];\n    let pref = 0, count = 0;\n    const freq = new Map();\n    freq.set(0, 1);\n    for (let i = 0; i < n; i++) {\n        pref ^= tokens[2 + i];\n        const target = pref ^ b;\n        if (freq.has(target)) count += freq.get(target);\n        freq.set(pref, (freq.get(pref) || 0) + 1);\n    }\n    console.log(count);\n}\n"
            },
            sample_testcases=[
                {"stdin": "5 6\n4 2 2 6 4", "expected_output": "4", "explanation": "Subarrays: [4, 2], [4, 2, 2, 6, 4], [2, 2, 6], [6]"},
                {"stdin": "4 1\n5 6 7 8", "expected_output": "2", "explanation": "Subarrays: [7], [5, 6, 7, 8]"}
            ],
            hidden_testcases=[
                {"stdin": "3 0\n1 1 1", "expected_output": "1", "weight": 50.0},
                {"stdin": "6 5\n1 2 3 4 5 6", "expected_output": "3", "weight": 50.0}
            ]
        )
        db.add(prob_b)

    await db.commit()
    print("✓ CCC Medi-Caps Database seeded with offline contest platform data and Phase 1 assessment.")

