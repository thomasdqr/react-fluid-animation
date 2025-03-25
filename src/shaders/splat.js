export default `
precision highp float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
uniform float uAdditiveMode;
uniform float uAdditiveThreshold; // Controls how much fluid is needed to turn white

void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  
  // In both modes, we use basic addition but with different handling
  vec3 result = base + splat;
  
  // Regular mode
  if (uAdditiveMode < 0.5) {
    gl_FragColor = vec4(result, 1.0);
  }
  // Additive mode
  else {
    // Ensure we don't exceed reasonable values to prevent rendering artifacts
    // This caps intensity while preserving color ratios for proper white blending
    // Scale the cap based on the threshold to allow more build-up for higher thresholds
    float maxCap = 50.0 * uAdditiveThreshold;
    float maxChannel = max(result.r, max(result.g, result.b));
    if (maxChannel > maxCap) {
      // Scale down while preserving color ratios
      result = result * (maxCap / maxChannel);
    }
    
    gl_FragColor = vec4(result, 1.0);
  }
}
`
