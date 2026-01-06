
export type PixelValue = boolean | string; // Boolean for black/white or string for color hex

export interface GeneratorOutput {
  grid: PixelValue[][];
  width: number;
  height: number;
  metadata?: Record<string, any>;
}
