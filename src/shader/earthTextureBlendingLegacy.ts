export class EarthTextureBlendingLegacyShader {
  public static readonly vertex: string = `
    varying vec2 vUv;
    varying vec3 vNormalWorld;

    void main() {
      vUv = uv;
      vNormalWorld = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  public static readonly fragment: string = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 customLightDirection;

    varying vec2 vUv;
    varying vec3 vNormalWorld;

    void main() {
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float NdotL = dot(vNormalWorld, normalize(customLightDirection));
      float blend = smoothstep(-0.05, 0.05, NdotL); // soft transition at the terminator
      gl_FragColor = mix(dayColor * vec4(0.6, 0.6, 0.6, 1.0), nightColor, blend);
    }
  `;

  private constructor() {}
}