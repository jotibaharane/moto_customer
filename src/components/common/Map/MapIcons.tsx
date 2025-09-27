// ===============================================
// File: src/components/MapIcons.tsx
// Description: Enhanced Pickup, Drop, and 3D-like Truck icons in Ola/Uber pin style
// Dependencies: react-native-svg
// ===============================================
import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

type IconProps = {
  size?: number;
};

// ===================
// Pickup Pin (Green)
// ===================
export const PickupPin: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size * 1.2} viewBox="0 0 64 76" fill="none">
    <Defs>
      <RadialGradient id="pickupGrad" cx="50%" cy="30%" r="50%">
        <Stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
        <Stop offset="100%" stopColor="#166534" stopOpacity="0.9" />
      </RadialGradient>
      <LinearGradient id="pickupShadow" x1="0" y1="0" x2="0" y2="64">
        <Stop offset="0%" stopColor="#000" stopOpacity="0.2" />
        <Stop offset="100%" stopColor="#000" stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#pickupGrad)"
      stroke="#14532d"
      strokeWidth={1.5}
    />
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#pickupShadow)"
    />
    <Circle
      cx="32"
      cy="24"
      r="9"
      fill="#fff"
      stroke="#14532d"
      strokeWidth={0.5}
    />
    <Circle cx="32" cy="24" r="3" fill="#14532d" />
  </Svg>
);

// ===================
// Drop Pin (Red)
// ===================
export const DropPin: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size * 1.2} viewBox="0 0 64 76" fill="none">
    <Defs>
      <RadialGradient id="dropGrad" cx="50%" cy="30%" r="50%">
        <Stop offset="0%" stopColor="#f87171" stopOpacity="1" />
        <Stop offset="100%" stopColor="#991b1b" stopOpacity="0.9" />
      </RadialGradient>
      <LinearGradient id="dropShadow" x1="0" y1="0" x2="0" y2="64">
        <Stop offset="0%" stopColor="#000" stopOpacity="0.2" />
        <Stop offset="100%" stopColor="#000" stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#dropGrad)"
      stroke="#7f1d1d"
      strokeWidth={1.5}
    />
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#dropShadow)"
    />
    <Circle
      cx="32"
      cy="24"
      r="9"
      fill="#fff"
      stroke="#7f1d1d"
      strokeWidth={0.5}
    />
    <Path d="M29 21h6v6h-6z" fill="#7f1d1d" />
  </Svg>
);

// ===================
// Truck Marker (Blue, 3D-like Front View)
// ===================
export const TruckMarker: React.FC<IconProps> = ({ size = 56 }) => (
  <Svg width={size} height={size * 1.2} viewBox="0 0 64 76" fill="none">
    <Defs>
      <RadialGradient id="truckGrad" cx="50%" cy="30%" r="50%">
        <Stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1e40af" stopOpacity="0.9" />
      </RadialGradient>
      <LinearGradient id="truckShadow" x1="0" y1="0" x2="0" y2="64">
        <Stop offset="0%" stopColor="#000" stopOpacity="0.15" />
        <Stop offset="100%" stopColor="#000" stopOpacity="0" />
      </LinearGradient>
      <LinearGradient id="truckBody" x1="50%" y1="0%" x2="50%" y2="100%">
        <Stop offset="0%" stopColor="#4b5e7a" stopOpacity="1" />
        <Stop offset="50%" stopColor="#2a3447" stopOpacity="1" />
        <Stop offset="100%" stopColor="#4b5e7a" stopOpacity="1" />
      </LinearGradient>
      <RadialGradient id="windshieldGrad" cx="50%" cy="20%" r="50%">
        <Stop offset="0%" stopColor="#e0f7fa" stopOpacity="0.9" />
        <Stop offset="100%" stopColor="#4b5e7a" stopOpacity="0.8" />
      </RadialGradient>
    </Defs>
    {/* Pin Shape */}
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#truckGrad)"
      stroke="#1e3a8a"
      strokeWidth={1.5}
    />
    {/* Inner shadow */}
    <Path
      d="M32 4c-12 0-22 10-22 22 0 14 22 40 22 40s22-26 22-40c0-12-10-22-22-22z"
      fill="url(#truckShadow)"
    />
    {/* Inner white circle */}
    <Circle
      cx="32"
      cy="24"
      r="10"
      fill="#fff"
      stroke="#1e3a8a"
      strokeWidth={0.5}
    />
    {/* Truck body (front view) */}
    <Path d="M25 18h14v10h-14v-10zm0 11h14v4h-14v-4z" fill="url(#truckBody)" />
    {/* Windshield */}
    <Path
      d="M27 20h10v4h-10v-4z"
      fill="url(#windshieldGrad)"
      stroke="#1e3a8a"
      strokeWidth={0.3}
    />
    {/* Grille */}
    <Path
      d="M28 25h8v2h-8v-2z"
      fill="#a0aec0"
      stroke="#1e3a8a"
      strokeWidth={0.2}
    />
    {/* Headlights */}
    <Circle
      cx="27"
      cy="28"
      r="1.5"
      fill="#fef08a"
      stroke="#1e3a8a"
      strokeWidth={0.2}
    />
    <Circle
      cx="37"
      cy="28"
      r="1.5"
      fill="#fef08a"
      stroke="#1e3a8a"
      strokeWidth={0.2}
    />
    {/* Wheels */}
    <Circle
      cx="27"
      cy="32"
      r="2"
      fill="#2d3748"
      stroke="#1e3a8a"
      strokeWidth={0.2}
    />
    <Circle
      cx="37"
      cy="32"
      r="2"
      fill="#2d3748"
      stroke="#1e3a8a"
      strokeWidth={0.2}
    />
    {/* Highlight on body */}
    <Path d="M26 19h12v1h-12v-1z" fill="#fff" fillOpacity="0.3" />
  </Svg>
);
