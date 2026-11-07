import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Fireworks } from "@/components/Fireworks";
import { config } from "@/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "நம் முதல் தீபாவளி – சமரலாகன் ❤️ குரோஷினி" },
      { name: "description", content: "என் அன்பான குரோஷினிக்கு – இனிய முதல் தீபாவளி நல்வாழ்த்துக்கள்!" },
      { property: "og:title", content: "நம் முதல் தீபாவளி" },
      { property: "og:description", content: "இரு ஊர்கள்... ஒரே காதல்... சமரலாகன் ❤️ குரோஷினி" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && set(true), { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function Ambience({ petals = 14, sparks = 20, hearts = 6 }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  const items = useMemo(() => ({
    p: Array.from({ length: petals }, (_, i) => ({ left: `${(i * 37) % 100}%`, animationDuration: `${9 + (i % 5) * 2}s`, animationDelay: `${-i * 1.3}s` })),
    s: Array.from({ length: sparks }, (_, i) => ({ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${(i % 7) * 0.4}s` })),
    h: Array.from({ length: hearts }, (_, i) => ({ left: `${10 + ((i * 41) % 80)}%`, animationDuration: `${12 + i * 2}s`, animationDelay: `${-i * 2.5}s`, fontSize: `${14 + (i % 3) * 6}px` })),
  }), [petals, sparks, hearts]);
  if (!on) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.s.map((st, i) => <span key={`s${i}`} className="spark" style={st as CSSProperties} />)}
      {items.p.map((st, i) => <span key={`p${i}`} className="petal" style={st as CSSProperties} />)}
      {items.h.map((st, i) => <span key={`h${i}`} className="float-heart" style={st as CSSProperties}>♥</span>)}
    </div>
  );
}

function Diyas({ n = 5 }) {
  return (
    <div className="flex items-end justify-center gap-6 sm:gap-10">
      {Array.from({ length: n }, (_, i) => <div key={i} className="diya" style={{ transform: `scale(${i === (n - 1) / 2 ? 1.2 : 0.9})` }} />)}
    </div>
  );
}

function Lines({ text, className = "", step = 0.5 }: { text: string; className?: string; step?: number }) {
  return (
    <>
      {text.split("\n").map((l, i) => (
        <Reveal key={i} delay={i * step}><p className={className}>{l}</p></Reveal>
      ))}
    </>
  );
}

/* --- Sri Lanka map: equirectangular projection, x=(lon-79.5)*100, y=(9.9-lat)*100 --- */
const proj = (lon: number, lat: number) => [(lon - 79.5) * 100, (9.9 - lat) * 100] as const;
const coast: [number, number][] = [
  [80.0, 9.82], [80.23, 9.83], [80.32, 9.6], [80.6, 9.4], [80.82, 9.27], [81.0, 8.95], [81.23, 8.57], [81.33, 8.25],
  [81.5, 7.95], [81.7, 7.72], [81.82, 7.4], [81.88, 7.1], [81.85, 6.85], [81.7, 6.5], [81.5, 6.3], [81.3, 6.2],
  [81.12, 6.12], [80.85, 6.0], [80.6, 5.92], [80.4, 5.97], [80.22, 6.03], [80.08, 6.3], [79.98, 6.6], [79.86, 6.93],
  [79.83, 7.2], [79.8, 7.6], [79.82, 7.95], [79.75, 8.2], [79.85, 8.5], [79.92, 8.8], [79.95, 8.95], [80.02, 9.1],
  [80.08, 9.35], [80.05, 9.55], [79.9, 9.7], [79.92, 9.78],
];
const outline = "M" + coast.map(([a, b]) => proj(a, b).map((v) => v.toFixed(1)).join(",")).join(" L") + " Z";
const mannarIsland = "M" + [[79.72, 9.1], [79.85, 9.03], [79.94, 8.97], [79.92, 9.0], [79.82, 9.07]].map(([a, b]) => proj(a, b).join(",")).join(" L") + " Z";
const JAFFNA = proj(80.01, 9.66);
const MANNAR = proj(79.9, 8.98);
const routeD = `M${JAFFNA[0]},${JAFFNA[1]} Q${JAFFNA[0] - 45},${(JAFFNA[1] + MANNAR[1]) / 2} ${MANNAR[0]},${MANNAR[1]}`;

function SriLankaMap() {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`mx-auto w-full max-w-md ${inView ? "is-in" : ""}`}>
      <svg viewBox="-40 0 300 410" className="h-auto w-full overflow-visible" role="img" aria-label="யாழ்ப்பாணம் மற்றும் மன்னாரை இணைக்கும் இலங்கை வரைபடம்">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blush)" />
            <stop offset="100%" stopColor="var(--background)" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d={outline} fill="url(#land)" stroke="var(--rose)" strokeWidth="2" strokeLinejoin="round" className="map-outline" />
        <path d={mannarIsland} fill="var(--blush)" stroke="var(--rose)" strokeWidth="1.5" />
        <path d={routeD} fill="none" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0" className="route-draw" pathLength={400} filter="url(#glow)" />
        {inView && (
          <text fontSize="14" fill="var(--deep-rose)" filter="url(#glow)">
            ♥
            <animateMotion dur="3.5s" begin="4.8s" repeatCount="indefinite" path={routeD} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
          </text>
        )}
        <g className="pop" style={{ animationDelay: "1.2s" }}>
          <circle cx={JAFFNA[0]} cy={JAFFNA[1]} r="12" fill="var(--gold)" opacity=".3" className="heartbeat" />
          <circle cx={JAFFNA[0]} cy={JAFFNA[1]} r="5" fill="var(--gold)" filter="url(#glow)" />
          <text x={JAFFNA[0] + 14} y={JAFFNA[1] - 8} fontSize="11" fill="var(--foreground)" fontFamily="Noto Sans Tamil">யாழ்ப்பாணம் – {config.him} ❤️</text>
        </g>
        <g className="pop" style={{ animationDelay: "1.8s" }}>
          <circle cx={MANNAR[0]} cy={MANNAR[1]} r="12" fill="var(--rose)" opacity=".3" className="heartbeat" />
          <circle cx={MANNAR[0]} cy={MANNAR[1]} r="5" fill="var(--deep-rose)" filter="url(#glow)" />
          <text x={MANNAR[0] + 10} y={MANNAR[1] + 20} fontSize="11" fill="var(--foreground)" fontFamily="Noto Sans Tamil">மன்னார் – {config.her} ❤️</text>
        </g>
        <text x="190" y="200" fontSize="13" fill="var(--rose)" fontFamily="Noto Serif Tamil" opacity=".6">இலங்கை</text>
      </svg>
    </div>
  );
}

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-20 text-center ${className}`}>{children}</section>;
}

const LOVE = `இந்த வருட தீபாவளி எனக்கு மிகவும் சிறப்பானது.
ஏனென்றால், காதலர்களாக நாம் கொண்டாடும் முதல் தீபாவளி இது.
என் வாழ்க்கையில் நீ வந்த பிறகு, சாதாரண நாட்கள்கூட அழகான நினைவுகளாக மாறிவிட்டன.
உன்னுடன் இன்னும் பல தீபாவளிகளையும், பல பண்டிகைகளையும், எண்ணற்ற அழகான தருணங்களையும் கொண்டாட ஆசைப்படுகிறேன்.
சில நேரங்களில் சின்னச் சின்ன சண்டைகள் வரலாம்... ஆனால் அந்தச் சண்டைகளுக்குப் பின்னாலும் உன்னையே அதிகமாக நேசிக்கும் ஒரு இதயம் இருக்கிறது.
நீ எப்போதும் சந்தோஷமாக இருக்க வேண்டும். உன் முகத்தில் இருக்கும் அந்த அழகான சிரிப்பு என்றும் மறையக்கூடாது.
என் வாழ்க்கையில் கிடைத்த அழகான பரிசு நீதான், ${config.her}.`;

function FireworksShow() {
  const [done, setDone] = useState(false);
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden bg-romance px-5 pb-24 text-center">
      <Fireworks intensity={2.2} finale onFinale={() => setDone(true)} />
      <div className={`reveal relative z-10 max-w-xl space-y-3 ${done ? "is-in" : ""}`}>
        <p className="font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">இந்த வானத்தில் ஆயிரம் நட்சத்திரங்கள் இருந்தாலும்...</p>
        <p className="font-serif text-2xl leading-relaxed sm:text-3xl"><span className="text-rosegold font-bold">என் உலகத்தின் மிக அழகான நட்சத்திரம் நீதான், {config.her}! ❤️</span></p>
      </div>
    </section>
  );
}

function Index() {
  const [photoRef, photoIn] = useInView<HTMLDivElement>();
  return (
    <main className="bg-romance text-foreground">
      {/* Opening */}
      <Section>
        <Ambience petals={18} sparks={30} hearts={8} />
        <div className="relative z-10 max-w-3xl space-y-5">
          <Reveal><p className="font-serif text-xl text-deep-rose sm:text-2xl">என் அன்பான {config.her}க்கு...</p></Reveal>
          <Reveal delay={0.9}><p className="text-lg text-muted-foreground sm:text-xl">இனிய தீபாவளி நல்வாழ்த்துக்கள்! ❤️</p></Reveal>
          <Reveal delay={1.8}><h1 className="text-rosegold py-3 text-5xl font-bold leading-tight sm:text-7xl">நம் முதல் தீபாவளி</h1></Reveal>
          <Reveal delay={2.7}><p className="font-serif text-2xl text-foreground sm:text-3xl">{config.him} <span className="heartbeat inline-block text-deep-rose">❤️</span> {config.her}</p></Reveal>
          <Reveal delay={3.5}><p className="text-base text-muted-foreground sm:text-lg">இரு ஊர்கள்... ஒரே காதல்... என்றும் இணைந்த இரு இதயங்கள்!</p></Reveal>
          <Reveal delay={4.2} className="pt-10"><Diyas /></Reveal>
        </div>
      </Section>

      {/* Map */}
      <Section>
        <Ambience petals={8} sparks={12} hearts={3} />
        <div className="relative z-10 w-full max-w-2xl space-y-8">
          <Reveal><h2 className="text-rosegold text-3xl font-bold sm:text-4xl">இரு ஊர்கள், ஒரே இதயம்</h2></Reveal>
          <SriLankaMap />
          <div className="space-y-3 font-serif text-lg leading-relaxed sm:text-xl">
            <Lines text={`யாழ்ப்பாணத்தில் நான்... மன்னாரில் நீ...\nநம்மிடையே எவ்வளவு தூரம் இருந்தாலும், என் இதயம் எப்போதும் உன்னிடம்தான்.\nவரைபடத்தில் இரு இடங்கள்... என் இதயத்தில் ஒரே ஒரு இடம் – அது உனக்கானது!`} />
          </div>
        </div>
      </Section>

      {/* Love message */}
      <Section className="bg-blush/40">
        <Ambience petals={12} sparks={14} hearts={4} />
        <div className="relative z-10 max-w-2xl space-y-6">
          <Reveal><h2 className="text-rosegold text-3xl font-bold sm:text-4xl">என் செல்லக் {config.her}... ❤️</h2></Reveal>
          <Lines text={LOVE} step={0.15} className="text-lg leading-loose sm:text-xl" />
          <Reveal><p className="font-serif text-2xl font-semibold text-deep-rose">இனிய நம் முதல் தீபாவளி வாழ்த்துக்கள், என் அன்பே! ❤️</p></Reveal>
          <Reveal className="pt-6"><Diyas n={3} /></Reveal>
        </div>
      </Section>

      <FireworksShow />

      {/* Name reveal */}
      <Section>
        <Ambience petals={14} sparks={24} hearts={10} />
        <div className="relative z-10 space-y-6">
          <Reveal><p className="font-serif text-xl text-muted-foreground sm:text-2xl">என் இதயத்தின் அழகான தேவதைக்கு...</p></Reveal>
          <Reveal delay={1}><h2 className="text-rosegold py-4 text-6xl font-bold drop-shadow sm:text-8xl">{config.her} <span className="heartbeat inline-block">❤️</span></h2></Reveal>
          <div className="space-y-2 font-serif text-xl sm:text-2xl">
            <Lines text={`உன் சிரிப்பில் என் சந்தோஷம்...\nஉன் அருகில் என் உலகம்...\nஉன் அன்பில் என் வாழ்க்கை!`} step={0.6} />
          </div>
        </div>
      </Section>

      {/* Photo */}
      <Section>
        <Ambience petals={16} sparks={20} hearts={8} />
        <div ref={photoRef} className="relative z-10 w-full max-w-4xl space-y-10">
          {photoIn && (
            <>
              <div className="gather mx-auto w-fit text-6xl text-deep-rose heartbeat">♥</div>
              <div className="gather rounded-3xl bg-gradient-to-br from-rose via-gold to-deep-rose p-2 shadow-glow sm:p-3" style={{ animationDelay: "0.8s", opacity: 0 }}>
                <img src={config.photo} alt={`${config.him} மற்றும் ${config.her}`} className="block h-auto w-full rounded-2xl" />
              </div>
            </>
          )}
          <div className="space-y-3 font-serif text-lg leading-relaxed sm:text-xl">
            <Lines text={`நாம் இருவரும் இணைந்திருக்கும் இந்தப் படம்...\nஎன் மனதில் என்றும் அழியாத அழகான நினைவு.\nஇந்தப் புகைப்படத்தில் இருப்பது இரண்டு முகங்கள் மட்டுமல்ல...\nஒருவரை ஒருவர் நேசிக்கும் இரண்டு இதயங்கள்!\nஇப்படியே பல அழகான நினைவுகளை ஒன்றாக உருவாக்குவோம், என் அன்பே. ❤️`} step={0.4} />
          </div>
        </div>
      </Section>

      {/* Finale */}
      <Section className="bg-blush/50">
        <Fireworks intensity={0.5} />
        <Ambience petals={14} sparks={26} hearts={6} />
        <div className="relative z-10 max-w-2xl space-y-6">
          <Reveal><h2 className="text-rosegold text-3xl font-bold leading-snug sm:text-5xl">இனிய முதல் தீபாவளி வாழ்த்துக்கள், என் காதலியே! ❤️</h2></Reveal>
          <Reveal delay={0.6}><p className="text-lg text-muted-foreground">{config.him}னின் இதயத்திலிருந்து {config.her}க்கு...</p></Reveal>
          <div className="space-y-2 font-serif text-xl">
            <Lines text={`இன்று நம் முதல் தீபாவளி...\nநாளை இன்னும் பல அழகான தீபாவளிகள்...\nஎன்றும் உன்னுடன் இருக்க வேண்டும் என்பதே என் ஆசை!`} />
          </div>
          <Reveal delay={0.4} className="pt-6"><p className="font-serif text-lg">என்றும் உன் அன்புடன்,</p><p className="text-rosegold font-serif text-3xl font-bold">{config.him} ❤️</p></Reveal>
          <Reveal className="pt-6"><div className="heartbeat text-7xl text-deep-rose drop-shadow">♥</div></Reveal>
          <Reveal><Diyas /></Reveal>
        </div>
      </Section>
    </main>
  );
}
