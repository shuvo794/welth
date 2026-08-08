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
  const strokeWidth = radius - innerRadius;
  const chartRadius = innerRadius + strokeWidth / 2;
  const circumference = 2 * Math.PI * chartRadius;

  const total = data.reduce((acc, item) => acc + (item.value || 0), 0);

  let accumulatedAngle = 0;

  if (total === 0 || data.length === 0) {
    return (
      <View style={{ width: size, height: size }}>
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

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDashoffset = circumference * (1 - percentage);
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
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                rotation={angle}
                origin={`${radius}, ${radius}`}
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export default PieChart;
