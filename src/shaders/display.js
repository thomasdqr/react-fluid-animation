export default `
precision highp float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec4 uBackgroundColor;

void main () {
  vec4 color = texture2D(uTexture, vUv);
  
  // Enhance color vibrancy (reduced from 0.85 to 1.0 - no enhancement)
  color.rgb = pow(color.rgb, vec3(1.0));
  
  // Calculate color intensity
  float colorIntensity = max(color.r, max(color.g, color.b));
  
  // Preserve saturation at high intensities
  if (colorIntensity > 0.0) {
    // Normalize the color to maintain its hue
    vec3 normalizedColor = color.rgb / colorIntensity;
    
    // Apply a curve to the intensity to prevent complete whitening
    // Reduced from 2.0 to 1.5 for less intensity
    float adjustedIntensity = 1.0 - exp(-colorIntensity * 1.5);
    
    // Scale down intensity to make it less saturated overall
    adjustedIntensity *= 0.8;
    
    // Mix with the background using the adjusted intensity
    vec3 finalColor = mix(uBackgroundColor.rgb, normalizedColor, adjustedIntensity);
    
    // Use the background's alpha, but increase it with fluid intensity
    // Multiply by 0.8 to make it more transparent
    float alpha = uBackgroundColor.a + (adjustedIntensity * 0.8) * (1.0 - uBackgroundColor.a);
    
    gl_FragColor = vec4(finalColor, alpha);
  } else {
    gl_FragColor = uBackgroundColor;
  }
}
`
