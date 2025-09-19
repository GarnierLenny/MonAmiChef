import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getProgressStatus } from "./utils";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart = ({
  percentage,
  size = 64,
  strokeWidth = 6,
}: DonutChartProps) => {
  const data = [
    { name: "completed", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  const colors = [getProgressStatus(percentage).strokeColor, "#e5e7eb"];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-bold text-gray-900 ${size >= 80 ? "text-sm" : "text-xs"}`}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};