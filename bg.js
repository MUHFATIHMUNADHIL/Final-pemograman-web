// ===== Latar belakang WebGL: glow asap/plasma lembut (ThreeJS shader) =====
// Full-bleed, atmosferik & meditatif: awan cahaya organik dari noise 3D,
// domain-warp agar terasa mengalir, drift halus mengikuti pointer.
// Preserve DOM fallback bila ThreeJS/WebGL tidak tersedia.
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  function domFallback() {
    canvas.style.background =
      "radial-gradient(65% 60% at 72% 32%, rgba(255,210,90,0.45), transparent 68%)," +
      "radial-gradient(55% 50% at 60% 40%, rgba(255,180,50,0.30), transparent 70%)," +
      "radial-gradient(60% 55% at 60% 45%, rgba(60,120,170,0.20), transparent 70%)," +
      "#000000";
    canvas.style.backgroundSize = "cover, cover, cover, cover";
    return;
  }

  const hasThree = typeof THREE !== "undefined";
  if (!hasThree) {
    domFallback();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch (e) {
    renderer = null;
  }
  if (!renderer) {
    domFallback();
    return;
  }

  const dprClamp = () => Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dprClamp());
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera(); // shader menggambar langsung di clip space

  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      float fbm(vec3 p) {
        float sum = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 5; i++) {
          sum += amp * snoise(p);
          p *= 2.02;
          amp *= 0.55;
        }
        return sum;
      }

      void main() {
        vec2 res = u_resolution;
        vec2 p = gl_FragCoord.xy / res - 0.5;
        p.x *= res.x / res.y;

        float t = u_time * 0.05;

        // domain warp agar awan terasa mengalir organik
        vec3 basePos = vec3(p * 1.5, t);
        vec2 warp = vec2(
          fbm(basePos + vec3(0.0, 0.0, 0.0)),
          fbm(basePos + vec3(5.2, 1.3, 1.7))
        );
        vec3 warpedPos = vec3(p * 1.5 + warp * 0.55 + u_mouse * 0.12, t + 3.1);
        float n = fbm(warpedPos);

        // titik pusat glow melayang perlahan (mirip referensi: condong ke kanan-atas)
        vec2 center = vec2(0.30, 0.30) + 0.06 * vec2(sin(t * 1.3), cos(t * 0.9)) + u_mouse * 0.05;
        float d = length(p - center);
        // radius lebih lebar + eksponen lebih rendah = asap lebih tebal/padat
        float glow = smoothstep(1.35, 0.0, d) * (0.7 + 0.55 * n);
        glow = pow(clamp(glow, 0.0, 1.0), 1.05);

        vec3 colGold = vec3(1.0, 0.86, 0.34);
        vec3 colGoldDeep = vec3(0.9, 0.68, 0.15);
        vec3 colBlue = vec3(0.24, 0.47, 0.67);
        vec3 mixed = mix(colBlue, mix(colGoldDeep, colGold, n * 0.5 + 0.5), smoothstep(-0.5, 0.35, n));

        // dorongan cahaya ekstra di inti asap agar lebih terang & bertenaga
        vec3 finalColor = mixed * (0.85 + 0.75 * glow);

        gl_FragColor = vec4(finalColor, clamp(glow * 1.15, 0.0, 1.0));
      }
    `,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function resize() {
    renderer.setPixelRatio(dprClamp());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  const mouseTarget = { x: 0, y: 0 };
  const mouseCurrent = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseTarget.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();

  function render(now) {
    const t = (now - start) * 0.001 * (reduce ? 0.4 : 1);

    mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
    mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;

    uniforms.u_time.value = t;
    uniforms.u_mouse.value.set(mouseCurrent.x, mouseCurrent.y);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

