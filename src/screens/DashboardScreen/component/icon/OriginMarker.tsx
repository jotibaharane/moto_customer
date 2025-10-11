import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

type Props = {
  size?: number; // width in px, component keeps aspect ratio
  style?: object;
};

export default function OriginMarker({ size = 200, style }: Props) {
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
          {/* Enhanced radial gradient for the ring */}
          <RadialGradient
            id="ringGrad"
            cx="45%"
            cy="35%"
            rx="70%"
            ry="70%"
            fx="35%"
            fy="25%"
          >
            <Stop offset="0%" stopColor="#d4ffa7" stopOpacity="1" />
            <Stop offset="40%" stopColor="#9fe04e" stopOpacity="1" />
            <Stop offset="70%" stopColor="#72b82f" stopOpacity="1" />
            <Stop offset="90%" stopColor="#4d8f23" stopOpacity="1" />
            <Stop offset="100%" stopColor="#3a7518" stopOpacity="1" />
          </RadialGradient>

          {/* Improved highlight with better positioning */}
          <RadialGradient
            id="ringHighlight"
            cx="40%"
            cy="25%"
            rx="50%"
            ry="50%"
          >
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>

          {/* Inner shadow for depth */}
          <RadialGradient id="innerShadow" cx="55%" cy="45%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <Stop offset="80%" stopColor="#000000" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Enhanced stem gradient */}
          <LinearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#7bc742" stopOpacity="1" />
            <Stop offset="40%" stopColor="#67b538" stopOpacity="1" />
            <Stop offset="80%" stopColor="#4d8f23" stopOpacity="1" />
            <Stop offset="100%" stopColor="#3a7518" stopOpacity="1" />
          </LinearGradient>

          {/* Stem highlight gradient */}
          <LinearGradient id="stemHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>

          {/* Donut mask */}
          <Mask id="donutMask">
            <Rect x="0" y="0" width={width} height={height} fill="white" />
            <Circle cx={50} cy={40} r={16} fill="black" />
          </Mask>
        </Defs>

        {/* Main donut with enhanced styling */}
        <G mask="url(#donutMask)">
          {/* Base circle */}
          <Circle cx={50} cy={40} r={36} fill="url(#ringGrad)" />

          {/* Highlight overlay */}
          <Circle cx={50} cy={40} r={36} fill="url(#ringHighlight)" />

          {/* Inner shadow for depth */}
          <Circle cx={50} cy={40} r={36} fill="url(#innerShadow)" />
        </G>

        {/* Enhanced inner circle with better shading */}
        <Circle cx={50} cy={40} r={16} fill="rgba(0,0,0,0.1)" />

        {/* Inner highlight to make hole appear rounded */}
        <Circle cx={48} cy={38} r={14} fill="rgba(255,255,255,0.1)" />

        {/* Improved stem with highlights */}
        <G>
          {/* Main stem body */}
          <Rect
            x={47}
            y={72}
            width={6}
            height={38}
            rx={3}
            ry={3}
            fill="url(#stemGrad)"
          />

          {/* Stem highlight */}
          <Rect
            x={47}
            y={72}
            width={2}
            height={38}
            rx={1}
            ry={1}
            fill="url(#stemHighlight)"
          />
        </G>

        {/* Enhanced tip with better styling */}
        <G>
          {/* Main tip */}
          <Polygon points="50,120 46,106 54,106" fill="url(#stemGrad)" />

          {/* Tip highlight */}
          <Path d="M 50 120 L 48 110 L 50 108 Z" fill="rgba(255,255,255,0.3)" />

          {/* Tip shadow for depth */}
          <Path d="M 50 120 L 52 110 L 50 108 Z" fill="rgba(0,0,0,0.1)" />
        </G>

        {/* Subtle glow effect */}
        <Circle
          cx={50}
          cy={40}
          r={38}
          fill="none"
          stroke="rgba(180,240,120,0.2)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
