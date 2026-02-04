
import * as THREE from 'three';
import { RainMode } from './types';

export const RAIN_COUNT = 20000;
export const BOUNDS = {
  width: 40,
  height: 60,
  depth: 40
};

export const COLORS = {
  [RainMode.NORMAL]: new THREE.Color(0xffaa00),    // Amber
  [RainMode.SUSPENDED]: new THREE.Color(0xfff4d1), // Warm Light Gold
  [RainMode.REVERSE]: new THREE.Color(0xff4500)    // Orange Red
};

export const PHYSICS = {
  [RainMode.NORMAL]: { speed: -1.0, drift: 0.05 },
  [RainMode.SUSPENDED]: { speed: 0.0, drift: 0.2 },
  [RainMode.REVERSE]: { speed: 0.8, drift: 0.1 }
};

export const LERP_FACTOR = 0.08;
