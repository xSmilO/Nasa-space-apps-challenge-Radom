export function easeInCirc(x: number): number {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export function easeOutCirc(x: number): number {
  return 1 - Math.pow(x - 1, 2);
}

export function easeInQuad(x: number): number {
  return x * x;
}