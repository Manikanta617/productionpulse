"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Film, 
  Upload, 
  BarChart3, 
  MessageSquare, 
  Zap, 
  Calendar, 
  Users, 
  Layers, 
  Sliders, 
  FileText, 
  ChevronRight, 
  Play, 
  Sparkles, 
  Database, 
  Cpu, 
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  const launchDemo = async (key: string) => {
    setLoadingDemo(key);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/projects/demo/seed/${key}`, { method: "POST" });
      if (res.ok) {
        const project = await res.json();
        router.push(`/dashboard?project=${project.id}`);
      } else {
        router.push(`/dashboard?demo=${key}`);
      }
    } catch {
      router.push(`/dashboard?demo=${key}`);
    } finally {
      setLoadingDemo(null);
    }
  };

  const agentCrew = [
    {
      role: "Line Producer Agent",
      icon: Zap,
      color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
      description: "Calculates department budgets, union overtime penalties, and analyzes cost variance in real time."
    },
    {
      role: "1st AD (Assistant Director)",
      icon: Calendar,
      color: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
      description: "Builds Hollywood-standard color-coded stripboards and groups scenes by lighting & location."
    },
    {
      role: "SAG-AFTRA Talent Coordinator",
      icon: Users,
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
      description: "Generates Day-Out-of-Days (DOOD) matrices to minimize actor idle holding day costs."
    },
    {
      role: "Safety & VFX Supervisor",
      icon: ShieldAlert,
      color: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
      description: "Assesses high-hazard stunts, pyrotechnic squibs, and heavy CGI sequences with risk telemetry."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber-500/30 selection:text-amber-300">
      {/* Navigation */}
      <nav className="border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">PRODUCTION<span className="text-amber-400">PULSE</span></span>
              <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">ClickHouse Track</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard?demo=mindheist" 
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors hidden sm:block"
            >
              Demo Studio
            </Link>
            <Link 
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              <Upload className="h-4 w-4" />
              Upload Screenplay
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Architecture Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono mb-8 glow-amber">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Autonomous Studio Intelligence</span>
            <span className="text-zinc-500">|</span>
            <span className="text-cyan-400 font-semibold">Google Cloud + ClickHouse Cloud</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-none">
            From Script to Set. <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">
              Autonomous Film Production Analytics.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            ProductionPulse transforms raw screenplay chaos into production-ready intelligence. Powered by <strong className="text-white">Google Gemini 2.5 Pro</strong> and <strong className="text-amber-400">ClickHouse Cloud</strong>, direct your multi-agent studio crew to generate instant budgets, stripboard schedules, and actor DOOD matrices.
          </p>

          {/* Quick Launch Demo Bar */}
          <div className="mt-10 max-w-2xl mx-auto p-4 rounded-2xl glass-panel border border-white/10">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Instant Zero-Config Interactive Demos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => launchDemo("mindheist")}
                disabled={loadingDemo !== null}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-amber-500/30 hover:border-amber-400 transition-all text-left group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-amber-300 flex items-center gap-2">
                    <Play className="h-4 w-4 text-amber-400 fill-amber-400" />
                    Mind Heist
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">15 Scenes · $160M Budget · 8 Cast</div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => launchDemo("cyberhorizon")}
                disabled={loadingDemo !== null}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-cyan-300 flex items-center gap-2">
                    <Play className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                    Cyber Horizon
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">12 Scenes · Bullet-Time VFX · Wire Combat</div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Agent Studio Crew Section */}
      <section className="py-20 border-t border-white/10 bg-zinc-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Autonomous Orchestration</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Meet Your AI Studio Production Crew</h2>
            <p className="text-zinc-400 mt-3 text-sm sm:text-base">
              A specialized multi-agent network orchestrated via Google ADK, querying ClickHouse in sub-milliseconds to solve enterprise film logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agentCrew.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <div 
                  key={idx} 
                  className={`p-6 rounded-2xl bg-gradient-to-b ${agent.color} border glass-panel transition-all hover:-translate-y-1`}
                >
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{agent.role}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{agent.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Studio Analytics Capabilities */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Hollywood Stripboard</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Color-coded stripboard shooting schedules following DGA standards (White Int Day, Yellow Ext Day, Green Int Night, Blue Ext Night). Minimizes location company moves and crew turnover.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-amber-400">
                <CheckCircle2 className="h-4 w-4" /> Production-Grade Schedule Generator
              </div>
            </div>

            <div className="p-8 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">SAG-AFTRA DOOD Matrix</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Complete Day-Out-of-Days matrix tracking Start (SW), Work (W), Finish (WF), and Hold (H) states. Automatically identifies idle talent hold penalties to prevent union budget leaks.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Union Rule Overtime Elimination
              </div>
            </div>

            <div className="p-8 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                  <Sliders className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Real-time What-If Simulator</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Adjust talent multipliers, cut visual effects sequences, or alter daily shooting limits with interactive sliders. ClickHouse recalculates the entire studio budget instantly.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-cyan-400">
                <CheckCircle2 className="h-4 w-4" /> Sub-Millisecond OLAP Simulation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Architecture Stack */}
      <section className="py-16 border-t border-white/10 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Under The Hood</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Built with Google Cloud & ClickHouse MCP</h2>
              <p className="text-sm text-zinc-400 max-w-xl">
                Combines Gemini 2.5 Pro multimodal screenplay parsing with ClickHouse&apos;s columnar speed for instant analytical aggregations, vector similarity, and real-time studio querying.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" /> ClickHouse Cloud OLAP
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" /> Google Gemini 2.5 Pro
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-xs font-mono text-zinc-300 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" /> Google ADK Framework
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>ProductionPulse · Built for Agentic Cinema: The Blockbuster Hackathon (ClickHouse Track)</p>
          <p className="mt-2 text-zinc-600">Open-Source under MIT License · Google Cloud & ClickHouse Integration</p>
        </div>
      </footer>
    </div>
  );
}
