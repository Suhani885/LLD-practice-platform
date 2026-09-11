import { TrendingUp } from "lucide-react";

export interface TrendPoint {
  date: string;
  score: number;
}

interface ScoreTrendChartProps {
  points: TrendPoint[];
}

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 20;

export function ScoreTrendChart({ points }: ScoreTrendChartProps) {
  const n = points.length;
  const xFor = (i: number) => PADDING + (n === 1 ? 0 : (i / (n - 1)) * (WIDTH - PADDING * 2));
  const yFor = (score: number) => HEIGHT - PADDING - (score / 100) * (HEIGHT - PADDING * 2);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.score).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(n - 1).toFixed(1)} ${HEIGHT - PADDING} L ${xFor(0).toFixed(1)} ${HEIGHT - PADDING} Z`;

  const first = points[0];
  const last = points[n - 1];
  const trendUp = last.score >= first.score;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-40 w-full"
        role="img"
        aria-label={`Score trend across ${n} attempts, from ${first.score} to ${last.score}`}
      >
        <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="var(--border)" strokeWidth={1} />
        <path d={areaPath} fill="var(--primary)" fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={xFor(i)} cy={yFor(p.score)} r={4} fill="var(--card)" stroke="var(--primary)" strokeWidth={2}>
            <title>{`${p.date}: ${p.score}/100`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{first.date}</span>
        <span className={trendUp ? "flex items-center gap-1 font-medium text-success" : "font-medium"}>
          {trendUp && <TrendingUp className="size-3.5" />}
          Latest: {last.score}
        </span>
        <span>{last.date}</span>
      </div>
    </div>
  );
}
