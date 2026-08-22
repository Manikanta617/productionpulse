"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface Location {
  name: string;
  scene_count: number;
  estimated_shoot_days: number;
  complexity_score: number;
  permit_required: boolean;
  permit_cost_usd: number;
}

interface LocationChartProps {
  locations: Location[];
}

export default function LocationChart({ locations }: LocationChartProps) {
  const data = locations.map((loc) => ({
    name: loc.name.length > 15 ? loc.name.slice(0, 15) + "..." : loc.name,
    fullName: loc.name,
    shootDays: loc.estimated_shoot_days,
    complexity: loc.complexity_score,
    scenes: loc.scene_count,
    permit: loc.permit_required,
    permitCost: loc.permit_cost_usd || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              formatter={(value: number, name: string) => {
                if (name === "shootDays") return [`${value} days`, "Shoot Days"];
                if (name === "complexity") return [`${value}/10`, "Complexity"];
                return [value, name];
              }}
            />
            <Bar dataKey="shootDays" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.complexity >= 8 ? "#ef4444" : entry.complexity >= 5 ? "#f59e0b" : "#10b981"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <div key={loc.name} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{loc.name}</h4>
              {loc.permit_required && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">
                  Permit
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Shoot Days</p>
                <p className="font-semibold">{loc.estimated_shoot_days}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Complexity</p>
                <p className={cn(
                  "font-semibold",
                  loc.complexity_score >= 8 ? "text-red-400" :
                  loc.complexity_score >= 5 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {loc.complexity_score}/10
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Scenes</p>
                <p className="font-semibold">{loc.scene_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Permit Cost</p>
                <p className="font-semibold">${(loc.permit_cost_usd || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
