import Svg, { Line, Rect } from 'react-native-svg';

import { View } from '@/components/Themed';

type SpectrumPlotProps = {
  magnitude: ArrayLike<number>;
  width?: number;
  height?: number;
  barColor?: string;
  /** Skip DC when scaling / drawing if desired. */
  fromBin?: number;
};

export function SpectrumPlot({
  magnitude,
  width = 320,
  height = 140,
  barColor = '#1B6CA8',
  fromBin = 0,
}: SpectrumPlotProps) {
  const count = magnitude.length;
  if (count <= fromBin) {
    return <View style={{ width, height }} />;
  }

  let peak = 0;
  for (let i = fromBin; i < count; i += 1) {
    peak = Math.max(peak, magnitude[i] ?? 0);
  }
  const scale = peak > 0 ? peak : 1;
  const bars = count - fromBin;
  const gap = 1;
  const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars);
  const baseY = height - 4;

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={0}
          y1={baseY}
          x2={width}
          y2={baseY}
          stroke="#9AA4B2"
          strokeWidth={1}
        />
        {Array.from({ length: bars }, (_, offset) => {
          const bin = fromBin + offset;
          const value = (magnitude[bin] ?? 0) / scale;
          const barHeight = Math.max(1, value * (height - 12));
          const x = offset * (barWidth + gap);
          return (
            <Rect
              key={bin}
              x={x}
              y={baseY - barHeight}
              width={barWidth}
              height={barHeight}
              fill={barColor}
            />
          );
        })}
      </Svg>
    </View>
  );
}
