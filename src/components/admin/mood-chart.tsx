import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";

type ChartDataPoint = {
  date: string;
  value: number;
};

type MoodChartProps = {
  data: ChartDataPoint[];
};

export default function MoodChart({ data }: MoodChartProps) {
  // Format date for display in tooltip and axis
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch (error) {
      return dateStr;
    }
  };
  
  // Map mood number values to text
  const getMoodText = (value: number) => {
    const moodMap: Record<number, string> = {
      1: "Sad",
      2: "Neutral",
      3: "Calm",
      4: "Happy"
    };
    return moodMap[value] || "Unknown";
  };
  
  // Add formatted date for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date),
    moodText: getMoodText(item.value)
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: "#eee" }}
        />
        <YAxis 
          domain={[0, 5]} 
          ticks={[1, 2, 3, 4]} 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: "#eee" }}
          tickFormatter={(value) => getMoodText(value)}
        />
        <Tooltip 
          formatter={(value, name) => [getMoodText(Number(value)), "Mood"]}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ 
            borderRadius: "4px", 
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            border: "none"
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#7e22ce" 
          strokeWidth={2} 
          dot={{ r: 4, fill: "#7e22ce", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#7e22ce", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}