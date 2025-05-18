import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

type MoodDistributionItem = {
  mood: string;
  count: number;
  percentage: number;
};

type MoodDistributionProps = {
  data: MoodDistributionItem[];
  className?: string;
  showLegend?: boolean;
};

export default function MoodDistribution({ data, className = "", showLegend = true }: MoodDistributionProps) {
  // Map moods to colors
  const moodColors: Record<string, string> = {
    happy: "#4ade80", // green
    calm: "#60a5fa", // blue
    neutral: "#94a3b8", // neutral
    sad: "#a78bfa", // purple
    angry: "#f87171", // red
    anxious: "#facc15", // yellow
  };
  
  return (
    <div className={`${className}`}>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={showLegend ? 30 : 40}
              outerRadius={showLegend ? 60 : 70}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="percentage"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={moodColors[entry.mood.toLowerCase()] || "#3b82f6"} 
                />
              ))}
            </Pie>
            {showLegend && (
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => {
                  if (typeof value === 'string') {
                    return value.charAt(0).toUpperCase() + value.slice(1);
                  }
                  return value;
                }}
              />
            )}
            <Tooltip 
              formatter={(value) => [`${value}%`, ""]}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0 && payload[0].payload && payload[0].payload.mood && typeof payload[0].payload.mood === 'string') {
                  return payload[0].payload.mood.charAt(0).toUpperCase() + payload[0].payload.mood.slice(1);
                }
                return label;
              }}
              contentStyle={{ 
                borderRadius: "4px", 
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                border: "none"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {!showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
          {data.map((item) => (
            <div key={item.mood} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: moodColors[item.mood.toLowerCase()] || "#3b82f6" }}
              />
              <div className="flex justify-between w-full">
                <span className="capitalize">{item.mood}</span>
                <span className="text-neutral-500">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}