// ===== Latar belakang WebGL: fine line lattice (perspective grid) =====
// Coinara — Trade, Save, and Grow: line trails + sparse anchors, breathing
// pulse, pointer-reactive drift. Preserve DOM fallback.
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
  const deriv = gl && gl.getExtension("OES_standard_derivatives");

  // --- DOM fallback bila WebGL / derivatives tidak didukung ---
  if (!gl || !deriv) {
    canvas.style.background =
      "radial-gradient(70% 60% at 50% 120%, rgba(194,166,51,0.12), transparent 60%)," +
      "radial-gradient(70% 60% at 50% -20%, rgba(60,120,170,0.14), transparent 60%)," +
      "#000000";
    return;
  }

  const vertexSrc = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const fragmentSrc = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // garis grid tipis anti-alias (butuh derivatives)
    float gridLayer(vec2 p) {
      vec2 g = abs(fract(p) - 0.5);
      vec2 d = g / fwidth(p);
      float line = min(d.x, d.y);
      return 1.0 - clamp(line, 0.0, 1.0);
    }

    void main() {
      vec2 res = u_resolution;
      vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;

      // drift pointer halus
      uv.x += u_mouse.x * 0.08;
      uv.y += u_mouse.y * 0.03;

      float t = u_time * 0.12;

      vec3 col = vec3(0.0);

      // bidang menyusut ke horizon, mengalir jelas
      float yd = abs(uv.y - 0.15) + 0.09;
      vec2 p;
      p.x = uv.x / yd * 1.1;
      p.y = 1.0 / yd + t * 3.0;

      float g = gridLayer(p);

      // pudar ke arah horizon dan tepi
      float fade = smoothstep(0.75, 0.05, yd);

      // breathing pulse lambat namun terasa
      float pulse = 0.65 + 0.35 * sin(u_time * 0.5);

      // dominan biru navy pucat dengan aksen emas yang cukup terlihat
      vec3 lineCol = mix(vec3(0.42, 0.55, 0.72), vec3(0.76, 0.65, 0.20), 0.32);

      col += lineCol * g * fade * pulse * 0.55;

      // sparse anchors: titik kelap-kelip di simpul grid
      vec2 ip = floor(p);
      float rnd = hash(ip);
      vec2 fp = fract(p) - 0.5;
      float anchor = smoothstep(0.08, 0.0, length(fp));
      float twinkle = step(0.9, rnd) * (0.5 + 0.5 * sin(u_time * 1.1 + rnd * 30.0));
      col += vec3(0.76, 0.65, 0.20) * anchor * twinkle * fade * 0.9;

      // garis horizon lembut
      float glowLine = smoothstep(0.08, 0.0, yd) * 0.35;
      col += lineCol * glowLine * pulse * 0.8;

      // vignette — menjaga efek tetap di tepi, pusat layar tetap bersih
      float vig = smoothstep(1.05, 0.3, length(uv));
      col *= vig;

      // alpha cukup terlihat tapi tidak mendominasi konten
      float alpha = clamp(max(max(col.r, col.g), col.b) * 1.3, 0.0, 0.6);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  // full-screen quad
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uMouse = gl.getUniformLocation(program, "u_mouse");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const mouse = { x: 0, y: 0 };
  let tx = 0, ty = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
  });
  window.addEventListener("resize", resize);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();

  function render(now) {
    mouse.x += (tx - mouse.x) * 0.05;
    mouse.y += (ty - mouse.y) * 0.05;

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduce ? 0 : (now - start) * 0.001);
    gl.uniform2f(uMouse, mouse.x, mouse.y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!reduce) requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
})();
