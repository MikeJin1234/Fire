
export enum RainMode {
  NORMAL = 'NORMAL',
  SUSPENDED = 'SUSPENDED',
  REVERSE = 'REVERSE'
}

export interface ControlState {
  handCount: number;
  mode: RainMode;
}

export interface Shaders {
  vertexShader: string;
  fragmentShader: string;
}
