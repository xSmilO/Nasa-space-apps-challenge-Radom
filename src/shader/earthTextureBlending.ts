export class EarthTextureBlendingShader {
  public static readonly vertex: string = `
    #define STANDARD

    varying vec3 vViewPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;     // <-- added

    #ifdef USE_TRANSMISSION
      varying vec3 vWorldPosition;
    #endif

    #include <common>
    #include <batching_pars_vertex>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    void main() {
      #include <uv_vertex>
      #include <color_vertex>
      #include <morphinstance_vertex>
      #include <morphcolor_vertex>
      #include <batching_vertex>
      #include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>
      #include <normal_vertex>
      
      // custom: compute world normal
      vWorldNormal = normalize( mat3( modelMatrix ) * normal );
      
      // custom: pass UVs
      vUv = uv;

      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>
      
      vViewPosition = - mvPosition.xyz;
      
      #include <worldpos_vertex>
      #include <shadowmap_vertex>
      #include <fog_vertex>
      
      #ifdef USE_TRANSMISSION
        vWorldPosition = worldPosition.xyz;
      #endif
    }
  `;

  public static readonly fragment: string = `
    #define STANDARD
    #ifdef PHYSICAL
      #define IOR
      #define USE_SPECULAR
    #endif

    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform float roughness;
    uniform float metalness;
    uniform float opacity;

    uniform sampler2D nightTexture; // <-- custom
    uniform vec3 customLightDirection; // <-- custom

    #ifdef IOR
      uniform float ior;
    #endif
    #ifdef USE_SPECULAR
      uniform float specularIntensity;
      uniform vec3 specularColor;
      #ifdef USE_SPECULAR_COLORMAP
        uniform sampler2D specularColorMap;
      #endif
      #ifdef USE_SPECULAR_INTENSITYMAP
        uniform sampler2D specularIntensityMap;
      #endif
    #endif

    varying vec3 vViewPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;  // <-- custom

    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <alphahash_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <iridescence_fragment>
    #include <cube_uv_reflection_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_physical_pars_fragment>
    #include <fog_pars_fragment>
    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_physical_pars_fragment>
    #include <transmission_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <clearcoat_pars_fragment>
    #include <iridescence_pars_fragment>
    #include <roughnessmap_pars_fragment>
    #include <metalnessmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>

    void main() {
      vec4 diffuseColor = vec4( diffuse, opacity );
      
      #include <clipping_planes_fragment>
      ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;
      
      #include <logdepthbuf_fragment>

      // --- custom day/night blending instead of map_fragment ---
      vec4 dayColor   = texture2D(map, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);

      // Ensure fully opaque
      dayColor.a = 1.0;
      nightColor.a = 1.0;

      // Determine light direction
      vec3 lightDir = vec3(0.0, 1.0, 0.0);
      #if NUM_DIR_LIGHTS > 0
          lightDir = directionalLights[0].direction;
      #endif

      // Compute N dot L and smoothstep blend
      float NdotL = dot(normalize(vWorldNormal), normalize(customLightDirection));
      float blend = smoothstep(-0.05, 0.5, NdotL);

      // Blend day and night colors
      vec4 texelColor = mix(dayColor, nightColor, blend);

      // Convert to linear manually (RGB only)
      vec3 linearTexelColor = pow(texelColor.rgb, vec3(2.2));

      // Apply to diffuseColor, keep alpha = 1.0
      diffuseColor.rgb *= linearTexelColor;
      diffuseColor.a = 1.0;
      // --- end custom block ---

      #include <color_fragment>
      #include <alphamap_fragment>
      #include <alphatest_fragment>
      #include <alphahash_fragment>
      #include <roughnessmap_fragment>
      #include <metalnessmap_fragment>
      #include <normal_fragment_begin>
      #include <normal_fragment_maps>
      #include <clearcoat_normal_fragment_begin>
      #include <clearcoat_normal_fragment_maps>
      #include <emissivemap_fragment>
      #include <lights_physical_fragment>
      #include <lights_fragment_begin>
      #include <lights_fragment_maps>
      #include <lights_fragment_end>
      #include <aomap_fragment>

      vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
      vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
      #include <transmission_fragment>

      vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

      #include <opaque_fragment>
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
      #include <premultiplied_alpha_fragment>
      #include <dithering_fragment>
    }
  `;

  private constructor() {}
}