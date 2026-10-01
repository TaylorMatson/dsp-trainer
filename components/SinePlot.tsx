import Svg, { Line, Polyline } from 'react-native-svg';

import { View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import { generateSineSamples } from '@/signal/sine';

type SinePlotProps = {
  frequencyHz: number;
  width?: number;
  height?: number;
  strokeColor?: string;
};

export function SinePlot({
  frequencyHz,
  width = 320,
  height = 140,
  strokeColor = AvTheme.plotPrimary,
}: SinePlotProps) {
  const sampleCount = 160;
  const samples = generateSineSamples({
    frequencyHz,
    sampleRateHz: frequencyHz * sampleCount,
    sampleCount,
    amplitude: 1,
  });

  const padY = 8;
  const midY = height / 2;
  const points = Array.from(samples, (value, index) => {
    const x = (index / (sampleCount - 1)) * width;
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
          stroke={AvTheme.grid}
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
