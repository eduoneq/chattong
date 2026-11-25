import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import hubRaw from "../assets/hub-cloud.svg?raw";
import { useReducedMotion } from "../lib/useReducedMotion";
import { BrandIcon, aiIconSrc, msgIconSrc } from "./BrandIcon";
import { MESSENGERS, type MessengerId } from "../data/messengers";

const HUB_SVG = hubRaw
  .replace(/<svg[^>]*>/, '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">')
  .replace(/\bid="([^"]+)"/g, 'id="hub$1"')
  .replace(/url\(#([^)]+)\)/g, "url(#hub$1)");

type Spot = { id: MessengerId; x: number; y: number };

type Layout = {
  id: "desk" | "mob";
  w: number;
  h: number;
  cols: number;
  rows: number;
  hub: { x: number; y: number; size: number };
  ms: number;
  msgs: Spot[];
  aw: number;
  ah: number;
  ax: number[];
  ay: number;
  capY: number;
};

const AIS: { id: string; name: string; mono?: boolean }[] = [
  { id: "claude", name: "Claude" },
  { id: "openai", name: "ChatGPT", mono: true },
  { id: "cursor", name: "Cursor", mono: true },
  { id: "grok", name: "Grok" },
];

const DESKTOP: Layout = {
  id: "desk",
  w: 1100,
  h: 730,
  cols: 11,
  rows: 7,
  hub: { x: 400, y: 58, size: 300 },
  ms: 72,
  msgs: [
    { id: "kakao", x: 64, y: 24 },
    { id: "insta", x: 214, y: 0 },
    { id: "messenger", x: 792, y: 6 },
    { id: "gmsg", x: 986, y: 92 },
    { id: "telegram", x: 1008, y: 248 },
    { id: "whatsapp", x: 940, y: 412 },
    { id: "slack", x: 792, y: 500 },
    { id: "line", x: 86, y: 508 },
    { id: "x", x: 16, y: 252 },
    { id: "discord", x: 228, y: 430 },
  ],
  aw: 156,
  ah: 108,
  ax: [211, 385, 559, 733],
  ay: 600,
  capY: 392,
};

const MOBILE: Layout = {
  id: "mob",
  w: 400,
  h: 568,
  cols: 5,
  rows: 7,
  hub: { x: 112, y: 72, size: 176 },
  ms: 54,
  msgs: [
    { id: "kakao", x: 14, y: 16 },
    { id: "gmsg", x: 332, y: 20 },
    { id: "insta", x: 10, y: 132 },
    { id: "line", x: 336, y: 138 },
    { id: "telegram", x: 16, y: 262 },
    { id: "slack", x: 328, y: 256 },
  ],
  aw: 86,
  ah: 74,
  ax: [16, 110, 204, 298],
  ay: 472,
  capY: 368,
};

function linkPath(layout: Layout, index: number) {
  const hx = layout.hub.x + layout.hub.size / 2;
  const hy = layout.hub.y + layout.hub.size - 8;
  const x = layout.ax[index] + layout.aw / 2;
  const y = layout.ay + 2;
  return `M ${hx} ${hy} C ${hx} ${hy + 42}, ${x} ${y - 56}, ${x} ${y}`;
}

function pause(ms: number, isDead: () => boolean) {
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      window.clearInterval(watch);
      resolve();
    };
    const timer = window.setTimeout(done, ms);
    const watch = window.setInterval(() => {
      if (isDead()) done();
    }, 40);
  });
}

export const Stage = memo(function Stage() {
  const reduced = useReducedMotion();
  const [layout, setLayout] = useState<Layout>(() =>
    window.matchMedia("(max-width: 860px)").matches ? MOBILE : DESKTOP,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<SVGSVGElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const hub3dRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const msgEls = useRef(new Map<string, HTMLDivElement>());
  const aiEls = useRef(new Map<string, HTMLDivElement>());
  const capRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const apply = () => setLayout(mq.matches ? MOBILE : DESKTOP);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const fit = () => {
      const scale = Math.min(1, wrap.clientWidth / layout.w);
      stage.style.transform = `scale(${scale})`;
      wrap.style.height = `${layout.h * scale}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [layout]);

  useEffect(() => {
    const svg = linksRef.current;
    const hubEl = hubRef.current;
    if (!svg || !hubEl) return;
    const hub: HTMLDivElement = hubEl;
    let dead = false;
    const isDead = () => dead;
    const anims: Animation[] = [];
    const timers: number[] = [];
    const play = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      const anim = el.animate(frames, opts);
      anims.push(anim);
      return anim;
    };
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => {
        if (!dead) fn();
      }, ms));
    };
    const ease = "cubic-bezier(.22,1,.36,1)";
    const paths = [...svg.querySelectorAll("path")];
    const lengths = paths.map((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = "1";
      return length;
    });
    const ais = AIS.map((item) => aiEls.current.get(item.id)).filter((el): el is HTMLDivElement => !!el);

    const showCap = (index: number) => {
      capRefs.current.forEach((el, i) => el?.classList.toggle("off", i !== index));
    };

    const resetActors = () => {
      anims.splice(0).forEach((anim) => anim.cancel());
      layout.msgs.forEach((spot) => {
        const el = msgEls.current.get(spot.id);
        if (!el) return;
        el.style.opacity = "0";
        el.style.filter = "none";
        el.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
      });
      ais.forEach((el, i) => {
        el.classList.remove("on");
        el.style.opacity = "0";
        el.style.filter = "none";
        el.style.transform = `translate(${layout.ax[i]}px, ${layout.ay}px)`;
      });
      paths.forEach((path, i) => {
        path.style.opacity = "1";
        path.style.strokeDasharray = `${lengths[i]}`;
        path.style.strokeDashoffset = `${lengths[i]}`;
      });
    };

    function showConnected() {
      resetActors();
      layout.msgs.forEach((spot) => {
        const el = msgEls.current.get(spot.id);
        if (el) el.style.opacity = "0";
      });
      ais.forEach((el) => {
        el.style.opacity = "1";
        el.classList.add("on");
      });
      paths.forEach((path) => {
        path.style.strokeDasharray = "4 7";
        path.style.strokeDashoffset = "0";
      });
      showCap(2);
    }

    async function loop() {
      const still = new URLSearchParams(window.location.search).has("still");
      resetActors();
      showCap(0);
      if (still) return;

      layout.msgs.forEach((spot, i) => {
        const el = msgEls.current.get(spot.id);
        if (!el) return;
        play(
          el,
          [
            { transform: `translate(${spot.x}px, ${spot.y + 22}px) scale(.86)`, filter: "blur(14px)", opacity: 0 },
            { transform: `translate(${spot.x}px, ${spot.y}px) scale(1)`, filter: "blur(0px)", opacity: 1 },
          ],
          { duration: 1100, delay: i * 90, easing: ease, fill: "forwards" },
        );
      });
      await pause(1200 + layout.msgs.length * 90 + 800, isDead);
      if (dead) return;
      if (new URLSearchParams(window.location.search).get("hold") === "scatter") return;

      layout.msgs.forEach((spot, i) => {
        const el = msgEls.current.get(spot.id);
        if (!el) return;
        play(
          el,
          [
            { transform: `translate(${spot.x}px, ${spot.y}px)` },
            { transform: `translate(${spot.x + (i % 2 ? 6 : -6)}px, ${spot.y - 8}px)` },
            { transform: `translate(${spot.x}px, ${spot.y}px)` },
          ],
          { duration: 1400, easing: "ease-in-out", fill: "forwards" },
        );
      });
      await pause(900, isDead);
      if (dead) return;

      showCap(1);
      const tx = layout.hub.x + layout.hub.size / 2 - layout.ms / 2;
      const ty = layout.hub.y + layout.hub.size / 2 - layout.ms / 2;
      layout.msgs.forEach((spot, i) => {
        const el = msgEls.current.get(spot.id);
        if (!el) return;
        const mx = (spot.x + tx) / 2;
        const my = (spot.y + ty) / 2 - 34;
        play(
          el,
          [
            { transform: `translate(${spot.x}px, ${spot.y}px) scale(1)`, opacity: 1, filter: "blur(0px)" },
            { transform: `translate(${mx}px, ${my}px) scale(.78)`, opacity: 1, filter: "blur(0px)", offset: 0.62 },
            { transform: `translate(${tx}px, ${ty}px) scale(.28)`, opacity: 0, filter: "blur(2px)" },
          ],
          { duration: 1080, delay: i * 100, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" },
        );
      });
      await pause(1080 + layout.msgs.length * 100, isDead);
      if (dead) return;

      play(
        hub,
        [{ transform: "scale(1)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }],
        { duration: 680, easing: ease },
      );
      await pause(380, isDead);
      if (dead) return;

      showCap(2);
      paths.forEach((path, i) => {
        play(
          path,
          [{ strokeDashoffset: lengths[i] }, { strokeDashoffset: 0 }],
          { duration: 700, delay: i * 120, easing: ease, fill: "forwards" },
        );
      });
      ais.forEach((el, i) => {
        play(
          el,
          [
            { transform: `translate(${layout.ax[i]}px, ${layout.ay + 16}px)`, opacity: 0, filter: "blur(8px)" },
            { transform: `translate(${layout.ax[i]}px, ${layout.ay}px)`, opacity: 1, filter: "blur(0px)" },
          ],
          { duration: 760, delay: 240 + i * 120, easing: ease, fill: "forwards" },
        );
        later(() => el.classList.add("on"), 860 + i * 120);
      });
      await pause(4600, isDead);
      if (dead) return;

      ais.forEach((el) => {
        play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 460, fill: "forwards" });
      });
      paths.forEach((path) => {
        play(path, [{ opacity: 1 }, { opacity: 0 }], { duration: 460, fill: "forwards" });
      });
      await pause(560, isDead);
      if (!dead) void loop();
    }

    if (reduced) showConnected();
    else void loop();

    return () => {
      dead = true;
      timers.forEach((id) => window.clearTimeout(id));
      anims.forEach((anim) => anim.cancel());
    };
  }, [layout, reduced]);

  useEffect(() => {
    if (reduced || layout.id === "mob") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const hub = hubRef.current;
    const tilt = hub3dRef.current;
    const cloud = cloudRef.current;
    const tile = tileRef.current;
    if (!hub || !tilt || !cloud || !tile) return;
    const spec = cloud.querySelector<SVGElement>(".spec");
    const state = { rx: 0, ry: 0, s: 1, px: 0, py: 0 };
    const velocity = { rx: 0, ry: 0, s: 0, px: 0, py: 0 };
    const target = { rx: 0, ry: 0, s: 1, px: 0, py: 0 };
    let hot = false;
    let last = performance.now();
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = hub.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (event.clientX - cx) / (rect.width * 1.6);
      const dy = (event.clientY - cy) / (rect.height * 1.6);
      const near = Math.hypot(event.clientX - cx, event.clientY - cy) < 520 ? 1 : 0;
      const nx = Math.max(-1, Math.min(1, dx)) * near;
      const ny = Math.max(-1, Math.min(1, dy)) * near;
      target.ry = nx * 12;
      target.rx = -ny * 10;
      target.px = nx * 7;
      target.py = ny * 5;
      const inside =
        event.clientX > rect.left &&
        event.clientX < rect.right &&
        event.clientY > rect.top &&
        event.clientY < rect.bottom;
      if (inside !== hot) {
        hot = inside;
        hub.classList.toggle("hot", hot);
        target.s = hot ? 1.06 : 1;
      }
      tile.style.setProperty("--hx", `${50 + nx * 45}%`);
      tile.style.setProperty("--hy", `${30 + ny * 40}%`);
      if (spec) spec.style.transform = `translate(${nx * 9}px, ${ny * 6}px)`;
    };
    const release = () => {
      target.rx = 0;
      target.ry = 0;
      target.s = 1;
      target.px = 0;
      target.py = 0;
      hot = false;
      hub.classList.remove("hot");
    };
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      (Object.keys(state) as (keyof typeof state)[]).forEach((key) => {
        const accel = 170 * (target[key] - state[key]) - 16 * velocity[key];
        velocity[key] += accel * dt;
        state[key] += velocity[key] * dt;
      });
      tilt.style.transform = `rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg) scale(${state.s.toFixed(4)})`;
      cloud.style.transform = `translate3d(${state.px.toFixed(2)}px, ${state.py.toFixed(2)}px, 30px)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", release);
    document.addEventListener("pointerleave", release);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", release);
      document.removeEventListener("pointerleave", release);
      cancelAnimationFrame(frame);
      hub.classList.remove("hot");
      tilt.style.transform = "";
      cloud.style.transform = "";
    };
  }, [reduced, layout.id]);

  const byId = new Map(MESSENGERS.map((item) => [item.id, item]));

  return (
    <div className="stage-wrap" ref={wrapRef} aria-hidden="true">
      <div
        className={`stage ${layout.id}`}
        ref={stageRef}
        style={{ width: layout.w, height: layout.h }}
      >
        <div
          className="tgrid"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: layout.cols * layout.rows }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <svg
          className="wires"
          ref={linksRef}
          viewBox={`0 0 ${layout.w} ${layout.h}`}
        >
          {layout.ax.map((_, i) => (
            <path key={i} d={linkPath(layout, i)} />
          ))}
        </svg>
        <div
          className="hub"
          ref={hubRef}
          style={{
            left: layout.hub.x,
            top: layout.hub.y,
            width: layout.hub.size,
            height: layout.hub.size,
          }}
        >
          <div className="hub-glow" />
          <div className="hub-float">
            <div className="hub-shadow" />
            <div className="hub-3d" ref={hub3dRef}>
              <div className="hub-tile" ref={tileRef} />
              <div
                className="hub-cloud"
                ref={cloudRef}
                dangerouslySetInnerHTML={{ __html: HUB_SVG }}
              />
            </div>
          </div>
        </div>
        {layout.msgs.map((spot) => {
          const meta = byId.get(spot.id);
          if (!meta) return null;
          return (
            <div
              key={spot.id}
              className={`m ${meta.fit}`}
              style={{ width: layout.ms, height: layout.ms }}
              ref={(node) => {
                if (node) msgEls.current.set(spot.id, node);
                else msgEls.current.delete(spot.id);
              }}
            >
              <BrandIcon
                src={msgIconSrc(spot.id)}
                mono={meta.mono}
                tint={meta.tint}
              />
            </div>
          );
        })}
        {AIS.map((item, i) => (
          <div
            key={item.id}
            className="ai"
            style={{
              width: layout.aw,
              height: layout.ah,
              transform: `translate(${layout.ax[i]}px, ${layout.ay}px)`,
            }}
            ref={(node) => {
              if (node) aiEls.current.set(item.id, node);
              else aiEls.current.delete(item.id);
            }}
          >
            <span className="s" />
            <span className="ic">
              <BrandIcon src={aiIconSrc(item.id)} mono={item.mono} />
            </span>
            <span className="n">{item.name}</span>
          </div>
        ))}
        <div className="cap" style={{ top: layout.capY }}>
          {["흩어진 메신저 대화가", "챗통 하나에 모이고", "내가 쓰는 AI에 연결됩니다"].map((line, i) => (
            <span
              key={line}
              className={i === 0 ? undefined : "off"}
              ref={(node) => {
                capRefs.current[i] = node;
              }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
