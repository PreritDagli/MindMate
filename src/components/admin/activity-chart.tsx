import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";

type ActivityDataPoint = {
  date: string;
  activeUsers: number;
};

type ActivityChartProps = {
  data: ActivityDataPoint[];
};

export default function ActivityChart({ data }: ActivityChartProps) {
  // Format date for display in tooltip and axis
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch (error) {
      return dateStr;
    }
  };
  
  // Add formatted date for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
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
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: "#eee" }}
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip 
          formatter={(value) => {
            if (value !== undefined) {
              return [value.toString(), "Active Users"];
            }
            return ["0", "Active Users"];
          }}
          labelFormatter={(label) => {
            if (label !== undefined) {
              return `Date: ${label}`;
            }
            return "Date: Unknown";
          }}
          contentStyle={{ 
            borderRadius: "4px", 
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            border: "none"
          }}
        />
        <Area 
          type="monotone" 
          dataKey="activeUsers" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.2} 
          strokeWidth={2} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}