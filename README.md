# 🎬 ProductionPulse
> **Enterprise Film Studio Analytics & Autonomous Multi-Agent Production Crew**  
> *Transforming Screenplay Chaos into Set-Ready Intelligence with ClickHouse Cloud and Google Gemini 2.5 Pro.*

[![Live Platform](https://img.shields.io/badge/Live%20Platform-Firebase%20Hosting-0284C7.svg)](https://productionpulse-hackathon.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![AI Engine](https://img.shields.io/badge/Google%20Cloud-Gemini%202.5%20Pro-4285F4.svg)](https://cloud.google.com/)
[![OLAP Analytics](https://img.shields.io/badge/ClickHouse-Cloud%20OLAP-F59E0B.svg)](https://clickhouse.com/)
[![Protocol](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-8B5CF6.svg)](https://modelcontextprotocol.io/)

---

## 📋 Executive Summary

| Layer | Technology & Architecture |
| :--- | :--- |
| **Live Web App** | **[https://productionpulse-hackathon.web.app](https://productionpulse-hackathon.web.app)** |
| **OLAP Analytics Engine** | **ClickHouse Cloud** (Columnar `MergeTree` tables, real-time materialized views) |
| **Protocol Integration** | **Model Context Protocol (MCP)** via persistent `mcp-clickhouse` ClientSession over JSON-RPC stdio |
| **AI Foundation** | **Google Gemini 2.5 Pro**, **Google ADK (Agent Development Kit)**, **Vertex AI** |
| **Performance Benchmark** | **<2ms** server-side ClickHouse query execution · **~500ms** (p50: 557ms) end-to-end agent reasoning |
| **Industry Compliance** | **SAG-AFTRA Theatrical Basic Agreement (DOOD)** · **DGA Stripboard Standards** |

---

## 🌟 The Enterprise Problem
High-end film and episodic television productions face multi-million-dollar logistical complexity:
1. **Manual Screenplay Breakdowns**: A standard 120-page screenplay requires days of manual line-item tagging across departments (scenes, characters, stunt hazards, and VFX cues).
2. **Actor Holding Cost Leaks**: Union contracts require paying principal cast full daily rates for idle "hold" days between active shooting days. Unoptimized schedules waste millions in holding penalties.
3. **Complex Location & Company Moves**: Relocating a 120-person film crew between locations costs upwards of $100,000 per company move.
4. **Slow Financial Forecasting**: Studio executives lack real-time modeling tools to answer immediate logistical questions (e.g. *"What is our budget exposure if we cut 4 night exterior shoots?"*).

---

## 🚀 The ProductionPulse Solution

ProductionPulse is an intelligent, multi-agent studio production platform that transforms raw screenplays into actionable production analytics powered by **ClickHouse Cloud** and **Google Gemini 2.5 Pro**.

### Core Capabilities:
* 📄 **Multimodal Screenplay Ingestion**: Upload PDF, TXT, or Fountain screenplays; extracts scenes, character appearances, props, VFX cues, and stunt hazards in seconds.
* 🎭 **SAG-AFTRA Day-Out-of-Days (DOOD) Matrix**: Color-coded matrix tracking Start (SW), Work (W), Finish (WF), and Hold (H) states to eliminate idle talent penalties.
* 🎬 **Hollywood Stripboard Scheduler**: Industry-standard color-coded stripboard (White Int Day, Amber Ext Day, Green Int Night, Blue Ext Night) grouped by location to optimize company moves.
* 🤖 **Autonomous Multi-Agent Studio Crew**:
  * **Line Producer Agent**: Budget calculations, overtime penalties, and financial rollups.
  * **1st AD (Assistant Director)**: Stripboard schedule optimization and company move minimization.
  * **SAG-AFTRA Talent Coordinator**: Day-Out-of-Days analysis and actor holding cost avoidance.
  * **Safety & VFX Supervisor**: High-hazard risk scores, wirework requirements, and CGI shot complexity.
* ⚡ **Live ClickHouse MCP Protocol Inspector**: Plain-English queries are translated by Gemini into optimized ClickHouse SQL, executed over persistent stdio MCP sessions with sub-millisecond OLAP speed (`<2ms` query execution, `~500ms` full end-to-end agent reasoning), and displayed transparently in real-time.
* 🌐 **Entertainment Industry Grounding Engine**: Cites verified union contracts and guild standards (*SAG-AFTRA Theatrical Basic Agreement, DGA Operations Guild, and VES VFX benchmarks*).
* 🎛️ **Real-Time What-If Scenario Simulator**: Interactive sliders to adjust VFX cutbacks, lead talent salary multipliers, and daily shoot limits, instantly recalculating studio budgets.
* 📋 **Exportable Industry Call Sheets**: Daily production call sheets complete with Leavesden Stage locations, cast schedules, meal breaks, and hospital contacts.
* 🍿 **Pre-Loaded Interactive Studio Datasets**: Instant 1-click datasets (*Mind Heist* & *Cyber Horizon*) for immediate evaluation without requiring file uploads.

---

## 🏗️ Architecture & Model Context Protocol (MCP)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                           │
│   TailwindCSS · Glassmorphism · Recharts · Radix UI · Dark Aesthetic   │
│   Deployed on Firebase Hosting (https://productionpulse-hackathon.web.app)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (JSON / REST)
┌───────────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (Python FastAPI)                          │
│                                                                        │
│  ┌────────────────────────┐         ┌───────────────────────────────┐  │
│  │   Screenplay Parser    │         │  Multi-Agent Studio Crew      │  │
│  │   (PyMuPDF + Gemini)   │         │  (Google ADK + Gemini 2.5 Pro)│  │
│  └───────────┬────────────┘         └───────────────┬───────────────┘  │
│              │                                      │                  │
│              │ Ingest Structured Scenes             │ StdioTransport   │
│              ▼                                      ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            mcp-clickhouse Subprocess & ClientSession             │  │
│  │     Persistent JSON-RPC stdio protocol over ClickHouse Cloud     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ TLS 8443 (Native HTTPS/TCP)     │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                CLICKHOUSE CLUSTER / CLOUD (OLAP)                 │  │
│  │                                                                  │  │
│  │   • scenes (scene_number, int_ext, time_of_day, vfx, stunts...)   │  │
│  │   • characters (appearances, is_lead, estimated_cost_per_day)    │  │
│  │   • locations (complexity, permit_required, shoot_days)          │  │
│  │   • budget_items (department rollups, line items)                │  │
│  │   • schedule_items (stripboards, daily shooting blocks)          │  │
│  │   • scene_summary (real-time materialized analytical view)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ClickHouse Schema & Real-Time Analytical Views

ProductionPulse leverages ClickHouse's speed for real-time analytics. Key tables include:

```sql
-- Core scenes table with columnar arrays
CREATE TABLE scenes (
    project_id UUID,
    scene_number UInt32,
    heading String,
    location String,
    int_ext String,
    time_of_day String,
    description String,
    characters Array(String),
    props Array(String),
    vfx_required Bool,
    stunts_required Bool,
    extras_count UInt32 DEFAULT 0,
    estimated_shoot_hours Float32 DEFAULT 0,
    page_count Float32 DEFAULT 0,
    mood String,
    complexity_score UInt8 DEFAULT 1,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, scene_number);

-- Real-time aggregation analytical view
CREATE OR REPLACE VIEW scene_summary AS
SELECT
    project_id,
    count() as total_scenes,
    sum(page_count) as total_pages,
    sum(estimated_shoot_hours) as total_shoot_hours,
    round(sum(estimated_shoot_hours) / 10, 1) as estimated_shoot_days,
    countIf(vfx_required) as vfx_scenes,
    countIf(stunts_required) as stunt_scenes,
    sum(extras_count) as total_extras,
    countIf(int_ext = 'interior') as interior_scenes,
    countIf(int_ext = 'exterior') as exterior_scenes,
    countIf(time_of_day = 'day') as day_scenes,
    countIf(time_of_day = 'night') as night_scenes,
    avg(complexity_score) as avg_complexity
FROM scenes
GROUP BY project_id;
```

---

## ⚡ Quick Start (Run Locally in 2 Minutes)

### Prerequisites
* Python 3.11+
* Node.js 20+

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (see `backend/.env.example`):
```env
# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# ClickHouse Cloud (OLAP Backbone)
CLICKHOUSE_HOST=your-cluster.clickhouse.cloud
CLICKHOUSE_PORT=8443
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DATABASE=default

# Optional Configurations
GCS_BUCKET=your-gcs-bucket
CORS_ORIGINS=http://localhost:3000,https://productionpulse-hackathon.web.app
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8080
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Authors & Maintainers
* **Manikanta K** — Architecture, Full Stack & AI Systems Engineering

## 📜 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
