import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5de2ff] block mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </span>
  );
}

// ─── CANVAS PARTICLE LATTICE ───────────────────────────────────────────────────

function ParticleLattice() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = { x: number; y: number; vx: number; vy: number };
    let particles: P[] = [];
    let raf: number;
    const mouse = { x: -999, y: -999 };

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const n = Math.floor((canvas.width * canvas.height) / 18000);
      particles = Array.from({ length: Math.min(n, 70) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    const tick = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      const LINK = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(93,226,255,${(1 - d / LINK) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        const mx = particles[i].x - mouse.x;
        const my = particles[i].y - mouse.y;
        const md = Math.hypot(mx, my);
        if (md < 220) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(93,226,255,${(1 - md / 220) * 0.22})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(93,226,255,0.5)";
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    init();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", init);
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-55" />;
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Services", "Systems", "Case Studies", "Demo", "Contact"];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id.toLowerCase().replace(" ", "-"))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-5xl"
      >
        <div
          className={`flex items-center justify-between px-6 h-12 rounded-sm transition-all duration-500 ${
            scrolled
              ? "bg-[rgba(5,5,7,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_0_40px_rgba(0,0,0,0.6)]"
              : "bg-[rgba(5,5,7,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)]"
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-5 h-5 relative">
              <svg viewBox="0 0 20 20" fill="none" className="w-full h-full">
                <rect x="1" y="1" width="8" height="8" stroke="#5de2ff" strokeWidth="1.5" />
                <rect x="11" y="1" width="8" height="8" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <rect x="1" y="11" width="8" height="8" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <rect x="11" y="11" width="8" height="8" stroke="#5de2ff" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <span
              className="text-[13px] font-semibold tracking-[0.12em] text-white uppercase"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.12em" }}
            >
              Praxis Ops
            </span>
          </button>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-[12px] text-[#aeb3be] hover:text-white transition-colors duration-200 tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("contact")}
              className="hidden md:flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-[#5de2ff] hover:text-white transition-colors duration-200 uppercase"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}
            >
              Connect With Praxis
              <ArrowRight size={10} />
            </button>
            <button
              className="md:hidden text-[#aeb3be] hover:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#050507] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(255,255,255,0.06)]">
              <span
                className="text-[13px] font-semibold tracking-[0.12em] text-white uppercase"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Praxis Ops
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-[#aeb3be]">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-10 gap-8">
              {links.map((link, i) => (
                <motion.button
                  key={link}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  onClick={() => scrollTo(link)}
                  className="text-left text-4xl font-light text-white hover:text-[#5de2ff] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}
                >
                  {link}
                </motion.button>
              ))}
            </div>
            <div className="px-10 pb-10">
              <button
                onClick={() => scrollTo("contact")}
                className="text-[#aeb3be] text-sm tracking-widest uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                praxisOps.support@gmail.com
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

const INDICATORS = [
  { label: "Lead Velocity", value: "+847%", note: "Avg across deployments" },
  { label: "Response Time", value: "<2s", note: "Operator engagement" },
  { label: "Qualification Rate", value: "94.3%", note: "Confirmed intent signal" },
  { label: "Automation Coverage", value: "98.1%", note: "Workflow touchpoints" },
];

function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleLattice />

      {/* Subtle radial glow behind headline */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(93,226,255,0.04) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* System badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 inline-flex items-center gap-2.5 px-4 py-1.5 border border-[rgba(93,226,255,0.2)] rounded-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#5de2ff] animate-pulse" />
          <span
            className="text-[10px] tracking-[0.2em] uppercase text-[#5de2ff]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Intelligent Business Infrastructure
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(52px,8vw,112px)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-8"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          BUILD SYSTEMS.
          <br />
          <span className="text-[rgba(255,255,255,0.18)]">NOT HEADCOUNT.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-[#aeb3be] text-[17px] leading-relaxed mb-12"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Praxis Ops deploys intelligent operators that qualify leads, automate
          conversations, coordinate workflows, and create measurable business outcomes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-7 py-3 bg-[#5de2ff] text-[#050507] text-[13px] font-semibold tracking-wider uppercase hover:bg-white transition-colors duration-300 rounded-sm"
            style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.08em" }}
          >
            Connect With Praxis
          </a>
          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-7 py-3 border border-[rgba(255,255,255,0.12)] text-white text-[13px] font-medium tracking-wider uppercase hover:border-[rgba(255,255,255,0.3)] transition-colors duration-300 rounded-sm flex items-center gap-2"
            style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.08em" }}
          >
            Request AI Demo
            <ArrowRight size={12} />
          </a>
        </motion.div>

        {/* Operational indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden"
        >
          {INDICATORS.map((ind) => (
            <div
              key={ind.label}
              className="bg-[#050507] px-6 py-5 flex flex-col gap-1 hover:bg-[rgba(93,226,255,0.03)] transition-colors duration-300"
            >
              <span
                className="text-[28px] font-black text-white tracking-tight"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {ind.value}
              </span>
              <span
                className="text-[11px] font-medium text-white/90"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {ind.label}
              </span>
              <span
                className="text-[10px] text-[#aeb3be] tracking-wide"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {ind.note}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-8 bg-gradient-to-b from-[rgba(255,255,255,0.2)] to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── SYSTEM PHILOSOPHY ─────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "Observe",
    body: "We map every touchpoint in your current operations — every handoff, delay, and manual decision point.",
  },
  {
    n: "02",
    title: "Design",
    body: "We architect the intelligence layer: which workflows automate, which operators engage, which signals trigger action.",
  },
  {
    n: "03",
    title: "Deploy",
    body: "Operators go live across your channels — voice, messaging, CRM, calendar. Zero friction onboarding.",
  },
  {
    n: "04",
    title: "Optimize",
    body: "Continuous feedback loops refine qualification logic, conversation quality, and conversion performance.",
  },
];

function SystemPhilosophy() {
  const [active, setActive] = useState(0);
  return (
    <section id="systems" className="relative py-32 px-6 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <FadeUp>
              <Label>System Philosophy</Label>
              <h2
                className="text-[clamp(36px,5vw,60px)] font-black text-white leading-[1.0] tracking-[-0.04em] mb-8"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Operations Become Infrastructure.
              </h2>
              <p className="text-[#aeb3be] text-[16px] leading-relaxed max-w-sm">
                We do not sell chatbots. We build operating systems for businesses — intelligent,
                measurable, and built to scale.
              </p>
            </FadeUp>
          </div>

          <div className="flex flex-col gap-px bg-[rgba(255,255,255,0.05)]">
            {STEPS.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.08}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-6 py-5 flex items-start gap-5 transition-all duration-300 ${
                    active === i
                      ? "bg-[rgba(93,226,255,0.05)] border-l-2 border-[#5de2ff]"
                      : "bg-[#050507] hover:bg-[rgba(255,255,255,0.02)] border-l-2 border-transparent"
                  }`}
                >
                  <span
                    className="text-[11px] text-[#aeb3be] mt-1 shrink-0 w-6"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <p
                      className={`text-[14px] font-semibold mb-1 transition-colors ${
                        active === i ? "text-white" : "text-[#aeb3be]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {step.title}
                    </p>
                    <AnimatePresence>
                      {active === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35 }}
                          className="text-[13px] text-[#aeb3be] leading-relaxed overflow-hidden"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {step.body}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ──────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "voice",
    title: "AI Voice Operators",
    body: "Intelligent voice systems that qualify inbound calls, follow up with leads, and handle tier-1 support — 24/7, without fatigue.",
    tag: "Inbound / Outbound",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Automation",
    body: "Conversational operators deployed across WhatsApp Business — from initial contact through appointment confirmation.",
    tag: "Messaging",
  },
  {
    id: "lead",
    title: "Lead Qualification",
    body: "Multi-signal qualification systems that score, segment, and route leads based on intent, behavior, and fit criteria.",
    tag: "Revenue",
  },
  {
    id: "crm",
    title: "CRM Intelligence",
    body: "Automated data enrichment, pipeline updates, and activity logging — your CRM stays current without human input.",
    tag: "Data",
  },
  {
    id: "booking",
    title: "Appointment Systems",
    body: "End-to-end booking infrastructure that confirms availability, sends reminders, and handles reschedules automatically.",
    tag: "Scheduling",
  },
  {
    id: "workflow",
    title: "Workflow Automation",
    body: "Cross-system process orchestration connecting your tools, teams, and data into one coherent operational layer.",
    tag: "Operations",
  },
  {
    id: "custom",
    title: "Custom AI Infrastructure",
    body: "Bespoke systems architected to your specific operational context — built with production-grade rigor from day one.",
    tag: "Enterprise",
  },
];

function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <FadeUp>
          <Label>Services</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            What We Deploy.
          </h2>
        </FadeUp>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-px overflow-x-auto pb-4 px-6 max-w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SERVICES.map((svc, i) => (
          <FadeUp key={svc.id} delay={i * 0.05}>
            <button
              onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}
              className={`shrink-0 w-[280px] text-left p-6 border transition-all duration-400 rounded-sm group ${
                expanded === svc.id
                  ? "bg-[rgba(93,226,255,0.05)] border-[rgba(93,226,255,0.25)]"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {svc.tag}
                </span>
                <ChevronRight
                  size={12}
                  className={`text-[#aeb3be] transition-transform duration-300 ${
                    expanded === svc.id ? "rotate-90 text-[#5de2ff]" : "group-hover:translate-x-0.5"
                  }`}
                />
              </div>
              <h3
                className="text-[18px] font-bold text-white mb-3 leading-tight tracking-[-0.02em]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {svc.title}
              </h3>
              <AnimatePresence>
                {expanded === svc.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-[13px] text-[#aeb3be] leading-relaxed overflow-hidden"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {svc.body}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ─── SYSTEM ARCHITECTURE ───────────────────────────────────────────────────────

const PIPELINE = [
  { label: "Lead", sub: "Signal captured" },
  { label: "AI", sub: "Intent processed" },
  { label: "Qualify", sub: "Criteria evaluated" },
  { label: "CRM", sub: "Record updated" },
  { label: "Booking", sub: "Appointment set" },
  { label: "Revenue", sub: "Outcome realized" },
];

function SystemArchitecture() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section className="py-32 border-t border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp>
          <Label>System Architecture</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-16"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            The Praxis Pipeline.
          </h2>
        </FadeUp>

        <div ref={ref} className="relative">
          {/* Nodes */}
          <div className="flex items-stretch gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {PIPELINE.map((node, i) => (
              <div key={node.label} className="flex items-center shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`w-16 h-16 rounded-sm border flex items-center justify-center mb-3 ${
                      i === 0 || i === PIPELINE.length - 1
                        ? "border-[#5de2ff] bg-[rgba(93,226,255,0.08)]"
                        : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium tracking-wide ${
                        i === 0 || i === PIPELINE.length - 1 ? "text-[#5de2ff]" : "text-[#aeb3be]"
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {`0${i + 1}`}
                    </span>
                  </div>
                  <p
                    className="text-[13px] font-semibold text-white mb-0.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {node.label}
                  </p>
                  <p
                    className="text-[10px] text-[#aeb3be] w-20 leading-tight"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {node.sub}
                  </p>
                </motion.div>

                {i < PIPELINE.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.12 + 0.3 }}
                    style={{ transformOrigin: "left" }}
                    className="w-8 h-px bg-gradient-to-r from-[rgba(255,255,255,0.15)] to-[rgba(255,255,255,0.06)] mx-2 shrink-0"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Signal line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
            className="mt-10 h-px bg-gradient-to-r from-[#5de2ff] via-[rgba(93,226,255,0.3)] to-transparent"
          />
        </div>
      </div>
    </section>
  );
}

// ─── INTERACTIVE DEMO ──────────────────────────────────────────────────────────

const PIPELINE_STAGES = ["Collect", "Analyze", "Map", "Generate", "Recommend"] as const;

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  businessSize: string;
  currentProcess: string;
  desiredOutcome: string;
  additionalNotes: string;
};

function InteractiveDemo() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    businessSize: "",
    currentProcess: "",
    desiredOutcome: "",
    additionalNotes: "",
  });
  const [stage, setStage] = useState<"idle" | "processing" | "done">("idle");
  const [pipelineStep, setPipelineStep] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage("processing");
    setPipelineStep(0);

    const request = fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email,
        company: form.company,
        industry: form.industry,
        currentProcess: form.currentProcess,
        desiredOutcome: form.desiredOutcome,
        notes: form.additionalNotes,
        formType: "request_ai_demo",
      }),
    });

    try {
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        await new Promise((r) => setTimeout(r, 700));
        setPipelineStep(i + 1);
      }

      const response = await request;
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to submit lead");
      }

      setStage("done");
    } catch {
      setStage("idle");
    }
  };

  const field = (
    key: keyof FormData,
    placeholder: string,
    type: string = "text"
  ) => (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] tracking-[0.15em] uppercase text-[#aeb3be]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {placeholder}
      </label>
      {key === "currentProcess" || key === "desiredOutcome" || key === "additionalNotes" ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-sm px-4 py-3 text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[rgba(93,226,255,0.4)] transition-colors resize-none"
          style={{ fontFamily: "Inter, sans-serif" }}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-sm px-4 py-3 text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[rgba(93,226,255,0.4)] transition-colors"
          style={{ fontFamily: "Inter, sans-serif" }}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <section id="demo" className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-3xl mx-auto px-6">
        <FadeUp>
          <Label>Interactive Demo</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Tell Us What You're Trying To Automate.
          </h2>
          <p className="text-[#aeb3be] text-[16px] mb-12">
            Our operators begin building your infrastructure map the moment this form is submitted.
          </p>
        </FadeUp>

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {field("name", "Full Name")}
              {field("email", "Email Address", "email")}
              {field("phone", "Phone Number", "tel")}
              {field("company", "Company Name")}
              {field("industry", "Industry")}
              {field("businessSize", "Business Size")}
              <div className="md:col-span-2">{field("currentProcess", "Current Process — What are you doing manually today?")}</div>
              <div className="md:col-span-2">{field("desiredOutcome", "Desired Outcome — What does success look like?")}</div>
              <div className="md:col-span-2">{field("additionalNotes", "Additional Notes")}</div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-[#050507] text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-[#5de2ff] transition-colors duration-300 rounded-sm"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Submit Request
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.form>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] gap-10"
            >
              <div className="flex flex-col items-start w-full max-w-xs gap-3">
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i < pipelineStep
                          ? "bg-[#5de2ff]"
                          : i === pipelineStep
                          ? "bg-[rgba(93,226,255,0.5)] animate-pulse"
                          : "bg-[rgba(255,255,255,0.1)]"
                      }`}
                    />
                    <span
                      className={`text-[12px] tracking-[0.15em] uppercase transition-colors duration-300 ${
                        i < pipelineStep ? "text-[#5de2ff]" : i === pipelineStep ? "text-white" : "text-[rgba(255,255,255,0.2)]"
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center gap-6"
            >
              <div className="w-12 h-12 border border-[#5de2ff] flex items-center justify-center rounded-sm">
                <span className="text-[#5de2ff] text-lg">✓</span>
              </div>
              <div>
                <p
                  className="text-[22px] font-bold text-white mb-2 tracking-[-0.02em]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Your request has entered the Praxis pipeline.
                </p>
                <p className="text-[#aeb3be] text-[14px]">
                  Our support team will reach out shortly.
                </p>
              </div>
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-[#aeb3be]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                praxisOps.support@gmail.com
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── CASE STUDIES ─────────────────────────────────────────────────────────────

const CASES = [
  {
    sector: "Residential Real Estate",
    challenge: "Agency losing 40% of inbound leads after hours with no follow-up system.",
    solution: "Deployed AI voice operator for immediate outreach and WhatsApp qualification sequence.",
    outcome: "Lead response time reduced from 6 hours to 90 seconds. Appointment rate increased 3.1×.",
    metrics: [
      { label: "Response Time", before: "6 hrs", after: "90 sec" },
      { label: "Appointment Rate", delta: "+3.1×" },
    ],
  },
  {
    sector: "Medical Practice",
    challenge: "Front desk handling 200+ daily calls — staff overwhelmed, bookings missed.",
    solution: "End-to-end appointment automation with insurance verification and reminder sequences.",
    outcome: "Staff call volume reduced 78%. No-show rate dropped from 22% to 6%.",
    metrics: [
      { label: "Call Volume Reduction", delta: "78%" },
      { label: "No-Show Rate", before: "22%", after: "6%" },
    ],
  },
  {
    sector: "Service Operations",
    challenge: "Field service company losing revenue from unqualified dispatch requests.",
    solution: "Intake qualification system with CRM routing and job-type classification.",
    outcome: "Dispatcher efficiency improved 2.4×. Revenue per job increased 31%.",
    metrics: [
      { label: "Dispatcher Efficiency", delta: "+2.4×" },
      { label: "Revenue per Job", delta: "+31%" },
    ],
  },
  {
    sector: "Internal Team Automation",
    challenge: "Operations team spending 60% of time on reporting and status updates.",
    solution: "Internal operator handling data aggregation, Slack reporting, and pipeline summaries.",
    outcome: "40 hours per week recovered. Team reallocated to strategic projects.",
    metrics: [
      { label: "Hours Recovered / Week", delta: "40 hrs" },
      { label: "Manual Reporting", before: "60%", after: "4%" },
    ],
  },
];

function CaseStudies() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="case-studies" className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp>
          <Label>Case Studies</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-12"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Outcomes, Not Outputs.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(255,255,255,0.05)]">
          {CASES.map((c, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left bg-[#050507] hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-300 p-8 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {c.sector}
                  </span>
                  <ChevronRight
                    size={12}
                    className={`text-[#aeb3be] transition-transform duration-300 ${open === i ? "rotate-90" : "group-hover:translate-x-0.5"}`}
                  />
                </div>

                <div className="flex gap-6 mb-5">
                  {c.metrics.map((m, j) => (
                    <div key={j}>
                      <div
                        className="text-[22px] font-black text-white tracking-tight"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {m.delta || m.after}
                      </div>
                      <div
                        className="text-[9px] text-[#aeb3be] tracking-wide"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
                        {[
                          { title: "Challenge", text: c.challenge },
                          { title: "Solution", text: c.solution },
                          { title: "Outcome", text: c.outcome },
                        ].map((row) => (
                          <div key={row.title}>
                            <span
                              className="text-[9px] tracking-[0.15em] uppercase text-[#5de2ff] block mb-1"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {row.title}
                            </span>
                            <p
                              className="text-[13px] text-[#aeb3be] leading-relaxed"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {row.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROCESS TIMELINE ─────────────────────────────────────────────────────────

const TIMELINE = [
  {
    n: "01",
    title: "Observe",
    body: "We study your current workflows in detail — calls, pipelines, handoffs, and gaps. We ask the uncomfortable questions.",
  },
  {
    n: "02",
    title: "Architect",
    body: "We design the operator network: which processes automate, which triggers fire, which data flows where.",
  },
  {
    n: "03",
    title: "Deploy",
    body: "Operators go live with precision. Every system tested, every edge case documented, zero surprises.",
  },
  {
    n: "04",
    title: "Scale",
    body: "We monitor performance, refine logic, and expand coverage as your operation grows.",
  },
];

function ProcessTimeline() {
  return (
    <section className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp>
          <Label>How Praxis Operates</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-16"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            From Discovery to Production.
          </h2>
        </FadeUp>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]" />

          <div className="flex flex-col gap-0">
            {TIMELINE.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.1}>
                <div className="relative flex gap-10 pb-12">
                  {/* Dot */}
                  <div className="relative shrink-0 w-12">
                    <div className="absolute left-0 top-1 w-12 h-12 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#5de2ff] z-10" />
                    </div>
                  </div>

                  <div className="pt-0">
                    <span
                      className="text-[10px] tracking-[0.15em] text-[#5de2ff] mb-2 block"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {step.n}
                    </span>
                    <h3
                      className="text-[24px] font-bold text-white tracking-[-0.03em] mb-3"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[14px] text-[#aeb3be] leading-relaxed max-w-md"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ENGAGEMENT MODELS ────────────────────────────────────────────────────────

const MODELS = [
  {
    title: "Strategic Build",
    body: "A focused engagement where we design, build, and hand off a complete operator system. Ideal for teams ready to own their infrastructure.",
    features: ["System architecture", "Operator configuration", "Integration setup", "Documentation + training"],
  },
  {
    title: "Managed Operations",
    body: "We operate your AI infrastructure on an ongoing basis — monitoring performance, adapting to changes, and driving continuous improvement.",
    features: ["Full operator management", "Performance monitoring", "Monthly optimization", "Dedicated support"],
    featured: true,
  },
  {
    title: "Enterprise Partnership",
    body: "A deep, long-term engagement for complex organizations requiring multi-system integration, custom model development, and dedicated engineering.",
    features: ["Custom infrastructure", "Multi-system orchestration", "Dedicated engineering", "Executive reporting"],
  },
];

function EngagementModels() {
  return (
    <section className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp>
          <Label>Engagement Models</Label>
          <h2
            className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            How We Work Together.
          </h2>
          <p className="text-[#aeb3be] text-[16px] mb-16">
            No pricing published. Every engagement is scoped to your operational context.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgba(255,255,255,0.05)]">
          {MODELS.map((m, i) => (
            <FadeUp key={m.title} delay={i * 0.08}>
              <div
                className={`h-full p-8 flex flex-col gap-6 ${
                  m.featured
                    ? "bg-[rgba(93,226,255,0.04)] border-t-2 border-t-[#5de2ff]"
                    : "bg-[#050507]"
                }`}
              >
                {m.featured && (
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase text-[#5de2ff]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Most Common
                  </span>
                )}
                <div>
                  <h3
                    className="text-[20px] font-bold text-white mb-3 tracking-[-0.02em]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="text-[13px] text-[#aeb3be] leading-relaxed"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {m.body}
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5 mt-auto">
                  {m.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-[12px] text-[#aeb3be]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <span className="w-px h-3 bg-[#5de2ff] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-4 flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#aeb3be] hover:text-[#5de2ff] transition-colors group"
                  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}
                >
                  Connect With Support
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: "",
          email: form.email,
          company: "",
          industry: "",
          currentProcess: "",
          desiredOutcome: "",
          notes: form.message,
          formType: "support",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to submit support request");
      }

      setSent(true);
    } catch {
      setSent(false);
    }
  };

  return (
    <section id="contact" className="py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left */}
          <FadeUp>
            <Label>Command Center</Label>
            <h2
              className="text-[clamp(32px,4.5vw,56px)] font-black text-white tracking-[-0.04em] leading-tight mb-8"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Connect.
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span
                  className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Contact
                </span>
                <a
                  href="mailto:praxisOps.support@gmail.com"
                  className="text-white text-[14px] hover:text-[#5de2ff] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  praxisOps.support@gmail.com
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5de2ff] animate-pulse" />
                  <span
                    className="text-[#5de2ff] text-[12px] tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Average Response
                </span>
                <span
                  className="text-white text-[14px]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {"<"}24 Hours
                </span>
              </div>
            </div>
          </FadeUp>

          {/* Right — form */}
          <FadeUp delay={0.15}>
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  className="flex flex-col gap-4"
                >
                  {[
                    { key: "name" as const, label: "Name", type: "text" },
                    { key: "email" as const, label: "Email", type: "email" },
                  ].map(({ key, label, type }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label
                        className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-sm px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[rgba(93,226,255,0.4)] transition-colors"
                        style={{ fontFamily: "Inter, sans-serif" }}
                        required
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-sm px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[rgba(93,226,255,0.4)] transition-colors resize-none"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="self-end flex items-center gap-2 px-7 py-3 bg-[#5de2ff] text-[#050507] text-[12px] font-semibold tracking-wider uppercase hover:bg-white transition-colors duration-300 rounded-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Send
                    <ArrowRight size={11} />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-center h-full gap-4 py-8"
                >
                  <div className="w-10 h-10 border border-[#5de2ff] flex items-center justify-center rounded-sm">
                    <span className="text-[#5de2ff]">✓</span>
                  </div>
                  <p
                    className="text-[18px] font-bold text-white tracking-tight"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Message received.
                  </p>
                  <p className="text-[#aeb3be] text-[13px]">
                    We will reach out within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Big wordmark */}
        <div className="mb-16 overflow-hidden">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="text-[clamp(52px,10vw,128px)] font-black text-white tracking-[-0.05em] leading-none"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              PRAXIS OPS
            </h2>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20 pt-10 border-t border-[rgba(255,255,255,0.05)]">
          <div className="col-span-2 md:col-span-1">
            <p
              className="text-[13px] text-[#aeb3be] leading-relaxed max-w-xs"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Intelligent business infrastructure. Built for operators who measure outcomes, not activity.
            </p>
          </div>

          <div>
            <p
              className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Navigation
            </p>
            <ul className="flex flex-col gap-2.5">
              {["Services", "Systems", "Case Studies", "Demo", "Contact"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollTo(link.toLowerCase().replace(" ", "-"))}
                    className="text-[13px] text-[#aeb3be] hover:text-white transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Contact
            </p>
            <a
              href="mailto:praxisOps.support@gmail.com"
              className="text-[13px] text-[#aeb3be] hover:text-[#5de2ff] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              praxisOps.support@gmail.com
            </a>
            <div className="flex items-center gap-1.5 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5de2ff] animate-pulse" />
              <span
                className="text-[10px] tracking-wider text-[#5de2ff]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ONLINE
              </span>
            </div>
          </div>

          <div>
            <p
              className="text-[9px] tracking-[0.2em] uppercase text-[#aeb3be] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Status
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Systems", status: "Operational" },
                { label: "Operators", status: "Active" },
                { label: "Pipeline", status: "Nominal" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4">
                  <span
                    className="text-[11px] text-[#aeb3be]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="text-[10px] text-[#5de2ff]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[rgba(255,255,255,0.05)]">
          <span
            className="text-[11px] text-[#aeb3be]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            © {year} Praxis Ops. All rights reserved.
          </span>
          <span
            className="text-[11px] text-[rgba(255,255,255,0.2)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Build serious systems.
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      className="min-h-screen bg-[#050507] text-white overflow-x-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Navbar />
      <Hero />
      <SystemPhilosophy />
      <Services />
      <SystemArchitecture />
      <InteractiveDemo />
      <CaseStudies />
      <ProcessTimeline />
      <EngagementModels />
      <ContactSection />
      <Footer />
    </div>
  );
}
