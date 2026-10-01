import Svg, { Line, Polyline } from 'react-native-svg';

import { View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';

type WaveformPlotProps = {
  samples: ArrayLike<number>;
  width?: number;
  height?: number;
  strokeColor?: string;
  gridColor?: string;
};

export function WaveformPlot({
  samples,
  width = 320,
  height = 140,
  strokeColor = AvTheme.plotPrimary,
  gridColor = AvTheme.grid,
}: WaveformPlotProps) {
  const count = samples.length;
  if (count < 2) {
    return <View style={{ width, height }} />;
  }

  const padY = 8;
  const midY = height / 2;
  const points = Array.from({ length: count }, (_, index) => {
    const value = samples[index] ?? 0;
    const x = (index / (count - 1)) * width;
    const y = midY - value * (midY - padY);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={0}
          y1={midY}
          x2={width}
          y2={midY}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <Polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}
