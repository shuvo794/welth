import React from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface PieChartItem {
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartItem[];
  radius?: number;
  innerRadius?: number;
  innerCircleColor?: string;
}

export function PieChart({
  data = [],
  radius = 60,
  innerRadius = 38,
  innerCircleColor = "#ffffff",
}: PieChartProps) {
  const size = radius * 2;
  const strokeWidth = Math.max(radius - innerRadius, 1);
  const chartRadius = innerRadius + strokeWidth / 2;
  const circumference = 2 * Math.PI * chartRadius;

  const validData = (data || []).filter((item) => item && item.value > 0);
  const total = validData.reduce((acc, item) => acc + item.value, 0);

  if (total <= 0 || validData.length === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={radius}
            cy={radius}
            r={chartRadius}
            stroke="#E8E6DF"
            strokeWidth={strokeWidth}
            fill={innerCircleColor}
          />
        </Svg>
      </View>
    );
  }

  let accumulatedAngle = 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          {validData.map((item, index) => {
            const percentage = item.value / total;
            const gap = validData.length > 1 ? 2 : 0;
            const strokeLength = Math.max(circumference * percentage - gap, 0);
            const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
            const angle = accumulatedAngle;
            accumulatedAngle += percentage * 360;

            return (
              <Circle
                key={index}
                cx={radius}
                cy={radius}
                r={chartRadius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                rotation={angle}
                origin={`${radius}, ${radius}`}
                fill="none"
                strokeLinecap="butt"
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export default PieChart;
