import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

type Props = {
  size?: number; // width in px, scales proportionally
  style?: object;
};

export default function DropMarker({ size = 200, style }: Props) {
  const width = 100;
  const height = 140;
  const scale = size / width;

  return (
    <View style={{ width: size, height: height * scale, ...style }}>
      <Svg
        width={size}
        height={height * scale}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Radial gradient for the red ring */}
          <RadialGradient
            id="ringRedGrad"
            cx="50%"
            cy="35%"
            rx="60%"
            ry="60%"
            fx="40%"
            fy="30%"
          >
            <Stop offset="0%" stopColor="#ffaaaa" stopOpacity="1" />
            <Stop offset="25%" stopColor="#ff4c4c" stopOpacity="1" />
            <Stop offset="60%" stopColor="#e02020" stopOpacity="1" />
            <Stop offset="100%" stopColor="#a81515" stopOpacity="1" />
          </RadialGradient>

          {/* Highlight overlay */}
          <RadialGradient
            id="ringRedHighlight"
            cx="45%"
            cy="28%"
            rx="40%"
            ry="40%"
            fx="45%"
            fy="28%"
          >
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <Stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>

          {/* Stem gradient */}
          <LinearGradient id="stemRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ff5a5a" stopOpacity="1" />
            <Stop offset="50%" stopColor="#e02020" stopOpacity="1" />
            <Stop offset="100%" stopColor="#a81515" stopOpacity="1" />
          </LinearGradient>

          {/* Mask for donut hole */}
          <Mask id="donutMask">
            <Rect x="0" y="0" width={width} height={height} fill="white" />
            <Circle cx={50} cy={40} r={18} fill="black" />
          </Mask>
        </Defs>

        {/* Donut with mask */}
        <G mask="url(#donutMask)">
          <Circle cx={50} cy={40} r={36} fill="url(#ringRedGrad)" />
          <Circle cx={50} cy={40} r={36} fill="url(#ringRedHighlight)" />
        </G>

        {/* faint inner shadow for hole */}
        <Circle cx={50} cy={40} r={18} fill="rgba(0,0,0,0.06)" />

        {/* Stem */}
        <Rect
          x={47}
          y={72}
          width={6}
          height={38}
          rx={3}
          ry={3}
          fill="url(#stemRedGrad)"
        />

        {/* Tip */}
        <Polygon
          points={`${50},120 ${46},106 ${54},106`}
          fill="url(#stemRedGrad)"
        />
      </Svg>
    </View>
  );
}
