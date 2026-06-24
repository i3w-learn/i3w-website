/* =========================================================================
   I3W — 3D logo engine
   The actual I3W mark (vector-traced from the logo) extruded into a real 3D
   metal object: studio-lit copper, slow rocking rotation, mouse parallax,
   subtle bloom on highlights. Falls back to a CSS glow with no WebGL and
   renders one static frame under prefers-reduced-motion.
   ========================================================================= */
import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildLogoShapes }  from './logo-shape.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE  = window.matchMedia('(pointer: coarse)').matches;

/* ---- build extruded geometry from the traced logo silhouette ---- */
function buildLogoGeometry(depth){
  // Platonic-ideal mark: real circular arcs (not a polygon trace) → needs real
  // curve tessellation so the sweeping curves are smooth, not faceted.
  const shapes = buildLogoShapes(THREE);
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth, bevelEnabled:true, bevelThickness:0.04, bevelSize:0.03, bevelSegments:4, steps:1, curveSegments:64
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/* ---- faint floating dust for depth (very subtle) ---- */
function makeDust(count){
  const N = COARSE ? Math.round(count*0.5) : count;
  const pos = new Float32Array(N*3), seed = new Float32Array(N);
  for(let i=0;i<N;i++){
    pos[i*3]   = (Math.random()*2-1)*5.5;
    pos[i*3+1] = (Math.random()*2-1)*3.4;
    pos[i*3+2] = (Math.random()*2-1)*3 - 1;
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed,1));
  const m = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{ uTime:{value:0}, uSize:{value:1.5*(window.devicePixelRatio||1)} },
    vertexShader:/* glsl */`
      uniform float uTime; uniform float uSize; attribute float aSeed; varying float vS;
      void main(){ vS=aSeed; vec3 p=position; p.y+=sin(uTime*0.15+aSeed*6.28)*0.15;
        vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;
        gl_PointSize=uSize*(90.0/-mv.z)*(0.4+aSeed); }`,
    fragmentShader:/* glsl */`
      varying float vS; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard;
        float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(vec3(0.72,0.76,0.84), a*(0.05+vS*0.10)); }`,
  });
  return new THREE.Points(g,m);
}

function initScene(canvas){
  const hero = canvas.dataset.scene !== 'ambient';
  const cfg = hero
    ? { scale:1.3,  camZ:5.2, offset:[1.7, -0.05], bloom:0.22, dust:120 }
    : { scale:0.98, camZ:5.6, offset:[1.9,  0.10], bloom:0.16, dust:70 };

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:!COARSE, alpha:true, powerPreference:'high-performance' }); }
  catch(e){ document.documentElement.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = cfg.camZ;

  // studio environment → believable metal reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // cool key + warm brand rim
  const key = new THREE.DirectionalLight(0xe6ecf6, 2.0); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff7a2f, 1.7); rim.position.set(4, -1.5, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x1c2330, 0.7));

  const group = new THREE.Group();
  group.position.set(cfg.offset[0], cfg.offset[1], 0);
  group.scale.setScalar(cfg.scale);

  const logo = new THREE.Mesh(
    buildLogoGeometry(0.4),
    new THREE.MeshStandardMaterial({ color:0xc0561d, metalness:0.96, roughness:0.31, envMapIntensity:1.3 })
  );
  group.add(logo);
  const dust = makeDust(cfg.dust); group.add(dust);
  scene.add(group);

  let composer, bloom;
  const setup = (w,h)=>{
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(w,h), cfg.bloom, 0.5, 0.8);  // only highlights glow
    composer.addPass(bloom);
  };
  const size = ()=>{
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w,h,false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
    group.position.x = cfg.offset[0] * (camera.aspect < 1 ? 0.25 : camera.aspect < 1.4 ? 0.62 : 1);
    if(!composer) setup(w,h); else composer.setSize(w,h);
  };
  size();

  const mouse = new THREE.Vector2(0,0), target = new THREE.Vector2(0,0);
  if(!COARSE) window.addEventListener('pointermove', (e)=>{
    target.x = (e.clientX/window.innerWidth)*2 - 1;
    target.y = -((e.clientY/window.innerHeight)*2 - 1);
  }, { passive:true });

  const clock = new THREE.Clock(); let running = true, raf = 0;
  const frame = ()=>{
    const t = clock.getElapsedTime();
    mouse.lerp(target, 0.06);
    logo.rotation.y = Math.sin(t*0.25)*0.85 + mouse.x*0.5;   // slow rock + cursor (stays readable)
    logo.rotation.x = -0.12 + Math.sin(t*0.4)*0.05 + mouse.y*0.3;
    group.position.y = cfg.offset[1] + Math.sin(t*0.6)*0.06; // gentle bob
    dust.material.uniforms.uTime.value = t;
    composer.render();
    if(running) raf = requestAnimationFrame(frame);
  };
  const renderOnce = ()=>{ logo.rotation.set(-0.16, -0.55, 0); composer.render(); };
  if(REDUCED) renderOnce(); else raf = requestAnimationFrame(frame);

  const stop  = ()=>{ if(running){ running=false; cancelAnimationFrame(raf); } };
  const start = ()=>{ if(!running && !REDUCED){ running=true; clock.start(); raf=requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
  if('IntersectionObserver' in window)
    new IntersectionObserver(([en])=> en.isIntersecting ? start() : stop(), { threshold:0 }).observe(canvas);
  let rt; window.addEventListener('resize', ()=>{ clearTimeout(rt); rt=setTimeout(size,150); }, { passive:true });
}

/* ---- DOM interactions: nav, mobile menu, scroll reveals, year ---- */
function initUI(){
  const nav = document.querySelector('.nav');
  const onScroll = ()=> nav && nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();

  const burger = document.querySelector('.nav-burger');
  if(burger){
    burger.addEventListener('click', ()=>{
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true':'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(a=>
      a.addEventListener('click', ()=> document.body.classList.remove('menu-open')));
  }

  if('IntersectionObserver' in window && !REDUCED){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const el = e.target;
        if(el.hasAttribute('data-reveal-stagger')){
          [...el.children].forEach((c,i)=> c.style.transitionDelay = (i*0.07)+'s');
        }
        el.classList.add('in'); io.unobserve(el);
      });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal],[data-reveal-stagger]').forEach(el=> io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal],[data-reveal-stagger]').forEach(el=> el.classList.add('in'));
  }

  if(!COARSE){
    document.querySelectorAll('.btn-primary, .nav-burger, .socials a').forEach(b=>{
      b.addEventListener('pointermove', (e)=>{
        const r=b.getBoundingClientRect();
        b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.18}px,${(e.clientY-r.top-r.height/2)*0.28}px)`;
      });
      b.addEventListener('pointerleave', ()=> b.style.transform='');
    });
  }

  // Contact form: real POST to the form's action endpoint, success only on success (Q58/Q59)
  const form = document.querySelector('#contactForm');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const ok = form.querySelector('.form-ok'), err = form.querySelector('.form-err');
      const btn = form.querySelector('button[type=submit]');
      const action = form.getAttribute('action') || '';
      ok && ok.classList.remove('show'); err && err.classList.remove('show');
      const fail = (msg)=>{ if(err){ err.textContent = msg; err.classList.add('show'); err.scrollIntoView({behavior:'smooth',block:'center'}); } };
      if(!action || /REPLACE|YOUR-ENDPOINT/i.test(action)){
        return fail("This form isn't connected yet, please email product@i3w.ai directly.");
      }
      try{
        if(btn) btn.disabled = true;
        const res = await fetch(action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
        if(res.ok){ if(ok){ ok.classList.add('show'); ok.scrollIntoView({behavior:'smooth',block:'center'}); } form.reset(); }
        else { fail("Something went wrong sending that. Please email product@i3w.ai."); }
      }catch(_){ fail("Couldn't reach the server. Please email product@i3w.ai."); }
      finally{ if(btn) btn.disabled = false; }
    });
  }

  // expandable job JDs (accordion)
  document.querySelectorAll('.job-row').forEach(row=>{
    const toggle = ()=>{
      const job = row.closest('.job');
      const open = job.classList.toggle('open');
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });
  });

  document.querySelectorAll('[data-year]').forEach(el=> el.textContent = new Date().getFullYear());
  initGsap();
}

/* ---- optional GSAP: stat count-up + gentle hero parallax (guarded) ---- */
function initGsap(){
  const g = window.gsap;
  const counters = document.querySelectorAll('[data-count]');
  // Q3/S7: stats must always show real values, never zero. Repair any leftover "0", no count-from-zero animation.
  counters.forEach(el=>{ if(el.textContent.trim()==='0'){ const dec=(el.dataset.count.split('.')[1]||'').length; el.textContent = parseFloat(el.dataset.count).toFixed(dec); } });
  if(!g || REDUCED || !window.ScrollTrigger) return;
  g.registerPlugin(window.ScrollTrigger);
  const hero = document.querySelector('.hero .wrap');
  if(hero) g.to(hero, { yPercent:9, opacity:.55, ease:'none',
    scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
}

/* ---- boot ---- */
function boot(){
  initUI();
  const canvas = document.querySelector('.scene-canvas');
  if(canvas) initScene(canvas);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
