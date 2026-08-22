"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Film, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles,
  Play,
  Layers
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [scriptTitle, setScriptTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!scriptTitle) setScriptTitle(dropped.name.replace(/\.[^/.]+$/, ""));
      if (!projectName) setProjectName(dropped.name.replace(/\.[^/.]+$/, ""));
      setError(null);
    }
  }, [scriptTitle, projectName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!scriptTitle) setScriptTitle(selected.name.replace(/\.[^/.]+$/, ""));
      if (!projectName) setProjectName(selected.name.replace(/\.[^/.]+$/, ""));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !projectName || !scriptTitle) {
      setError("Please specify a project name, script title, and select a screenplay file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Create project
      const projectRes = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, script_title: scriptTitle }),
      });

      if (!projectRes.ok) throw new Error("Failed to create project record");
      const project = await projectRes.json();

      // Step 2: Upload script
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API_URL}/api/projects/${project.id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail || "Script analysis failed");
      }

      router.push(`/dashboard?project=${project.id}`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setIsUploading(false);
    }
  };

  const loadSampleScript = async (key: string) => {
    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/demo/seed/${key}`, { method: "POST" });
      if (res.ok) {
        const proj = await res.json();
        router.push(`/dashboard?project=${proj.id}`);
      } else {
        router.push(`/dashboard?demo=${key}`);
      }
    } catch {
      router.push(`/dashboard?demo=${key}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-lg text-white">Upload Screenplay</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Gemini 2.5 Pro Multimodal Parsing</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Import Screenplay to ClickHouse</h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Drop your PDF, TXT, or Fountain script. Our AI extracts scene headings, character rosters, props, VFX cues, and builds your analytical database.
          </p>
        </div>

        {/* Form Box */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Project / Movie Name</label>
              <input
                type="text"
                placeholder="e.g. Cyberpunk Noir 2099"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Screenplay Title & Author</label>
              <input
                type="text"
                placeholder="e.g. Blade Runner Reborn - Written by..."
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive 
                ? "border-amber-400 bg-amber-500/10" 
                : file 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-white/10 hover:border-white/20 bg-zinc-900/40"
            }`}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt,.fountain"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-zinc-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Drag & drop your screenplay PDF or click to browse</p>
                  <p className="text-xs text-zinc-500 mt-1">Supports standard Hollywood formats: PDF, TXT, Fountain</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing Screenplay with Gemini & Ingesting to ClickHouse...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Screenplay & Build Production Database
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Screenplays Box */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">Or Try Pre-Parsed Blockbusters</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => loadSampleScript("mindheist")}
              disabled={isUploading}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-amber-500/30 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-xs text-white group-hover:text-amber-300 block">Mind Heist</span>
                <span className="text-[11px] text-zinc-500">15 Scenes · 8 Characters · Paris, Mombasa</span>
              </div>
              <Play className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400" />
            </button>

            <button
              onClick={() => loadSampleScript("cyberhorizon")}
              disabled={isUploading}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-xs text-white group-hover:text-cyan-300 block">Cyber Horizon</span>
                <span className="text-[11px] text-zinc-500">12 Scenes · Bullet-Time VFX · Virtual Dojo</span>
              </div>
              <Play className="h-3.5 w-3.5 text-zinc-500 group-hover:text-cyan-400" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
