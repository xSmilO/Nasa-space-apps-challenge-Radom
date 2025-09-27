export class CloudsMorphShader {
  public static readonly vertex: string = `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  public static readonly fragment: string = `
    uniform sampler2D map;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 uv1 = vUv + vec2(time * 0.00005, 0.0);
      vec2 uv2 = vUv + vec2(0.0, time * 0.00003);

      vec4 layer1 = texture2D(map, uv2);
      vec4 layer2 = texture2D(map, uv2);

      vec4 clouds = mix(layer1, layer2, 0.5);

      gl_FragColor = vec4(clouds.rgb, clouds.a * 0.8);
    }
  `;

  private constructor() {}
}