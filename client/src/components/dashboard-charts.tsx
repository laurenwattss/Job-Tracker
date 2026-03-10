import { useMemo } from "react";
import type { Prospect } from "@shared/schema";
import { STATUSES } from "@shared/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const stageColors: Record<string, string> = {
  Bookmarked: "hsl(217, 91%, 60%)",
  Applied: "hsl(239, 84%, 67%)",
  "Phone Screen": "hsl(263, 70%, 58%)",
  Interviewing: "hsl(38, 92%, 50%)",
  Offer: "hsl(160, 84%, 39%)",
  Rejected: "hsl(0, 84%, 60%)",
  Withdrawn: "hsl(215, 14%, 50%)",
};

const companyColors = [
  "hsl(217, 91%, 60%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(263, 70%, 58%)",
  "hsl(0, 84%, 60%)",
  "hsl(330, 81%, 60%)",
  "hsl(190, 90%, 50%)",
  "hsl(80, 65%, 45%)",
  "hsl(30, 90%, 55%)",
  "hsl(280, 65%, 55%)",
  "hsl(200, 80%, 55%)",
  "hsl(350, 75%, 50%)",
];

export function DashboardCharts({ prospects }: { prospects: Prospect[] }) {
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUSES) counts[s] = 0;
    for (const p of prospects) {
      if (counts[p.status] !== undefined) counts[p.status]++;
    }
    return STATUSES.map((s) => ({ stage: s, count: counts[s] }));
  }, [prospects]);

  const barConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    for (const s of STATUSES) {
      cfg[s] = { label: s, color: stageColors[s] };
    }
    cfg.count = { label: "Applications" };
    return cfg;
  }, []);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prospects) {
      counts[p.companyName] = (counts[p.companyName] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        fill: companyColors[i % companyColors.length],
      }));
  }, [prospects]);

  const pieConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    pieData.forEach((d) => {
      cfg[d.name] = { label: d.name, color: d.fill };
    });
    cfg.value = { label: "Applications" };
    return cfg;
  }, [pieData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-6 pt-4" data-testid="dashboard-charts">
      <Card data-testid="chart-stages">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Applications by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[200px] w-full aspect-auto">
            <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval={0}
                tickFormatter={(v: string) => (v.length > 8 ? v.slice(0, 7) + "…" : v)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.stage} fill={stageColors[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card data-testid="chart-companies">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            Companies Applied To
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ChartContainer config={pieConfig} className="h-[200px] w-full aspect-auto">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={2}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground" data-testid="chart-companies-empty">
              No company data yet
            </div>
          )}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center" data-testid="chart-companies-legend">
              {pieData.slice(0, 8).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="truncate max-w-[100px]">{d.name}</span>
                </div>
              ))}
              {pieData.length > 8 && (
                <span className="text-xs text-muted-foreground">+{pieData.length - 8} more</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
