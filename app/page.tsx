import Link from 'next/link'
import { Trophy, ArrowRight, ShieldCheck, Zap, Users, Play } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col relative overflow-hidden">

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] swirl swirl-blue animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] swirl swirl-pink animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Navbar */}
      <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0F]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tighter outfit">
              CRICK<span className="text-purple-500">FORM</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold uppercase tracking-widest hover:text-purple-400 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="btn-cyber text-[10px] py-3 px-6">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-32 md:py-48">

        {/* Particle/Motion UI Element (Visual Snippet) */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-float">
            <path fill="none" stroke="url(#hero-grad)" strokeWidth="0.5" d="M40,100 C40,40 160,40 160,100 C160,160 40,160 40,100" className="animate-[spin_20s_linear_infinite]" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="0.2" />
            <defs>
              <linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 animate-fade-in backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" />
          The Future of Tournament Management
        </div>

        <h1 className="text-6xl md:text-[120px] font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto animate-fade-in outfit">
          BORN TO <br />
          <span className="neon-text italic">COMPETE.</span> <br />
          BUILT TO LEAD.
        </h1>

        <p className="mt-12 text-lg md:text-xl text-white/50 max-w-2xl mx-auto animate-fade-in font-medium leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Beautiful forms. Secure payments. <br />
          A sleek, motion-driven dashboard for the next generation of sports creators.
        </p>

        <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in w-full sm:w-auto" style={{ animationDelay: '0.3s' }}>
          <Link href="/signup" className="btn-cyber py-5 px-12 text-lg flex items-center gap-3">
            Deploy Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="btn-cyber-outline py-5 px-12 text-lg flex items-center gap-3">
            <Play className="w-5 h-5 fill-white" />
            Watch Intro
          </button>
        </div>

        {/* Floating Credit Card / Form Mockup Area */}
        <div className="mt-24 w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="fluid-glass p-1 rounded-[2rem] glow-primary">
            <div className="bg-[#0A0A0F]/80 rounded-[1.8rem] aspect-video flex items-center justify-center overflow-hidden border border-white/5">
              <div className="grid grid-cols-2 gap-8 p-12 w-full h-full">
                <div className="space-y-6">
                  <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-4 w-2/3 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-12 w-full bg-purple-500/20 rounded-xl" />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl" />
                  <div className="relative h-full w-full bg-white/5 rounded-2xl border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black outfit mb-6">ENGINEERED FOR SPEED</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: ShieldCheck, title: "CYBER SECURITY", desc: "Enterprise-grade Aadhaar validation and mobile lock systems to keep your data pure.", color: "purple" },
              { icon: Zap, title: "FLUID PAYMENTS", desc: "Integrated Razorpay with instant UPI settlement. No friction, just flow.", color: "blue" },
              { icon: Users, title: "MOTION ANALYTICS", desc: "Track performance in real-time with responsive dashboards and fluid data exports.", color: "pink" }
            ].map((f, i) => (
              <div key={i} className="fluid-glass group p-10 rounded-[2.5rem] hover:translate-y-[-10px] transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-${f.color}-500/10 flex items-center justify-center mb-10 border border-${f.color}-500/20`}>
                  <f.icon className={`w-8 h-8 text-${f.color}-500`} />
                </div>
                <h3 className="text-2xl font-bold outfit mb-4 uppercase tracking-tight">{f.title}</h3>
                <p className="text-white/40 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-20 px-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl outfit tracking-widest">CRICKFORM</span>
          </div>
          <p className="text-white/30 font-medium text-sm text-center">
            EST. 2026 — PUSHING THE BOUNDARIES OF CREATIVE DEPLOYMENT
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
