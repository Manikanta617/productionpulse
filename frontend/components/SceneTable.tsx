"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Layers, 
  MapPin, 
  Users, 
  Package 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Scene {
  scene_number: number;
  heading: string;
  location: string;
  int_ext: string;
  time_of_day: string;
  description: string;
  characters: string[];
  props: string[];
  vfx_required: boolean;
  stunts_required: boolean;
  extras_count: number;
  estimated_shoot_hours: number;
  page_count: number;
  mood: string;
  complexity_score: number;
}

interface SceneTableProps {
  scenes: Scene[];
}

export default function SceneTable({ scenes }: SceneTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Scene>("scene_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedScene, setExpandedScene] = useState<number | null>(null);

  // Filter scenes
  const filteredScenes = scenes.filter((scene) => {
    // Search query match
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      scene.heading.toLowerCase().includes(q) ||
      scene.location.toLowerCase().includes(q) ||
      scene.description.toLowerCase().includes(q) ||
      (scene.characters || []).some((c) => c.toLowerCase().includes(q)) ||
      (scene.props || []).some((p) => p.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Filter pill match
    if (activeFilter === "vfx") return scene.vfx_required;
    if (activeFilter === "stunts") return scene.stunts_required;
    if (activeFilter === "interior") return scene.int_ext?.toLowerCase() === "interior";
    if (activeFilter === "exterior") return scene.int_ext?.toLowerCase() === "exterior";
    if (activeFilter === "night") return scene.time_of_day?.toLowerCase() === "night";

    return true;
  });

  // Sort filtered scenes
  const sortedScenes = [...filteredScenes].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDir === "asc"
      ? String(aVal || "").localeCompare(String(bVal || ""))
      : String(bVal || "").localeCompare(String(aVal || ""));
  });

  const toggleSort = (field: keyof Scene) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof Scene }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-zinc-600" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-amber-400" />
    ) : (
      <ChevronDown className="h-3 w-3 text-amber-400" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search scene, location, character, or prop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: "all", label: "All Scenes", count: scenes.length },
            { id: "vfx", label: "VFX Only", icon: Sparkles, count: scenes.filter(s => s.vfx_required).length },
            { id: "stunts", label: "Stunts Only", icon: ShieldAlert, count: scenes.filter(s => s.stunts_required).length },
            { id: "interior", label: "Interior", count: scenes.filter(s => s.int_ext?.toLowerCase() === "interior").length },
            { id: "exterior", label: "Exterior", count: scenes.filter(s => s.int_ext?.toLowerCase() === "exterior").length },
            { id: "night", label: "Night", icon: Moon, count: scenes.filter(s => s.time_of_day?.toLowerCase() === "night").length }
          ].map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-[11px] border",
                  isActive
                    ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                    : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span>{filter.label}</span>
                <span className={cn("text-[9px] px-1 py-0.2 rounded", isActive ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-400")}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenes Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-zinc-950/80">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase border-b border-white/10">
              <tr>
                <th
                  className="px-3 py-3 text-left cursor-pointer hover:text-white transition-colors w-16"
                  onClick={() => toggleSort("scene_number")}
                >
                  <span className="flex items-center gap-1"># <SortIcon field="scene_number" /></span>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort("heading")}
                >
                  <span className="flex items-center gap-1">Scene Heading <SortIcon field="heading" /></span>
                </th>
                <th
                  className="px-3 py-3 text-left cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
                  onClick={() => toggleSort("location")}
                >
                  <span className="flex items-center gap-1">Location <SortIcon field="location" /></span>
                </th>
                <th className="px-3 py-3 text-left hidden md:table-cell">Type & Time</th>
                <th
                  className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors w-24"
                  onClick={() => toggleSort("complexity_score")}
                >
                  <span className="flex items-center justify-center gap-1">Score <SortIcon field="complexity_score" /></span>
                </th>
                <th className="px-3 py-3 text-center w-20">Tags</th>
                <th className="px-3 py-3 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedScenes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 font-mono">
                    No scenes found matching the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                sortedScenes.map((scene) => {
                  const isExpanded = expandedScene === scene.scene_number;
                  return (
                    <React.Fragment key={scene.scene_number}>
                      <tr
                        onClick={() => setExpandedScene(isExpanded ? null : scene.scene_number)}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-zinc-900/60",
                          isExpanded && "bg-zinc-900/40"
                        )}
                      >
                        <td className="px-3 py-3 font-mono font-bold text-amber-400">
                          #{scene.scene_number}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          <div>{scene.heading}</div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 font-normal mt-0.5">
                            {scene.description}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-zinc-300 hidden sm:table-cell font-mono text-[11px]">
                          {scene.location}
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell font-mono text-[11px] text-zinc-400">
                          <span className="capitalize">{scene.int_ext}</span> · <span className="capitalize">{scene.time_of_day}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px]",
                              scene.complexity_score >= 8
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : scene.complexity_score >= 5
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            )}
                          >
                            {scene.complexity_score}/10
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {scene.vfx_required && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                                VFX
                              </span>
                            )}
                            {scene.stunts_required && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
                                STUNT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-500">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                      </tr>

                      {/* Expanded Scene Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-zinc-900/90">
                          <td colSpan={7} className="p-4 space-y-3 border-t border-white/5">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                                Scene Action & Description
                              </span>
                              <p className="text-xs text-zinc-200 leading-relaxed">
                                {scene.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1 mb-1.5">
                                  <Users className="h-3 w-3 text-cyan-400" /> Characters in Scene
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(scene.characters || []).length > 0 ? (
                                    scene.characters.map((c, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-mono">
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-zinc-500 text-[11px]">No specific characters</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1 mb-1.5">
                                  <Package className="h-3 w-3 text-amber-400" /> Props & Set Pieces
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(scene.props || []).length > 0 ? (
                                    scene.props.map((p, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-mono">
                                        {p}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-zinc-500 text-[11px]">Standard set dress</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                                  Shooting Schedule Metrics
                                </span>
                                <p className="text-zinc-300 font-mono text-[11px]">
                                  Est. Hours: <strong className="text-white">{scene.estimated_shoot_hours}h</strong> · Page Count: <strong className="text-white">{scene.page_count} pgs</strong>
                                </p>
                                <p className="text-zinc-400 font-mono text-[11px]">
                                  Extras: <strong className="text-white">{scene.extras_count}</strong> · Mood: <strong className="text-amber-300 capitalize">{scene.mood || "Standard"}</strong>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React from "react";
