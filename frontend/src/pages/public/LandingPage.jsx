import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Target, Zap, Trophy, Lock, CheckCircle, Bell, 
  Linkedin, Github, Instagram, Mail, Code, Activity 
} from 'lucide-react';
import { Button } from '../../components/ui/Components';

const LandingPage = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col w-full">
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-6 lg:px-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur fixed w-full z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
          <Shield className="text-red-600 w-8 h-8" />
          <span className="text-2xl font-black tracking-tighter">CULLING<span className="text-red-600">GAMES</span></span>
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('home')} className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer">Home</button>
          <button onClick={() => scrollToSection('features')} className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer">Features</button>
          <button onClick={() => scrollToSection('about-dev')} className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer">About Me</button>
          {/* Added Leaderboard Link */}
          <Link to="/leaderboard" className="text-zinc-400 hover:text-white font-medium transition-colors flex items-center gap-1">
            <Trophy size={16} /> Leaderboard
          </Link>
        </div>

        <div>
          <Link to="/register">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition-all shadow-lg shadow-red-900/20">
              Register Team
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden pt-20 w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-5xl lg:text-8xl font-black mb-6 tracking-tighter z-10 animate-fade-in relative">
          SURVIVE THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900">NIGHT</span>
        </h1>
        
        <p className="text-zinc-400 text-lg lg:text-xl max-w-2xl mb-10 z-10 animate-fade-in relative" style={{ animationDelay: '0.1s' }}>
          "Only those who dare to fail greatly can ever achieve greatly." <br/>
          <span className="text-sm text-red-500 italic mt-2 block">- The Game Master</span>
        </p>

        <div className="z-10 animate-fade-in relative" style={{ animationDelay: '0.2s' }}>
          <Link to="/login">
            <Button className="px-12 py-5 text-xl font-bold tracking-widest shadow-red-600/40 hover:scale-105 transition-transform">
              ENTER ARENA
            </Button>
          </Link>
        </div>
      </section>

      {/* About Game Section */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">THE GAME PROTOCOL</h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-12">
            The Culling Games is not just a hackathon. It is a battle of intellect, strategy, and endurance. 
            Teams must complete cryptic directives, sabotage rivals using acquired 'Powers', and maintain their 
            server uptime while under attack. 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-black border border-red-900/30 rounded-lg">
              <Target className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Execute</h3>
              <p className="text-zinc-500 text-sm">Solve algorithmic challenges under extreme time pressure.</p>
            </div>
            <div className="p-6 bg-black border border-red-900/30 rounded-lg">
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Sabotage</h3>
              <p className="text-zinc-500 text-sm">Use points to freeze other teams or corrupt their data.</p>
            </div>
            <div className="p-6 bg-black border border-red-900/30 rounded-lg">
              <Trophy className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Dominate</h3>
              <p className="text-zinc-500 text-sm">Climb the live leaderboard and claim the ultimate title.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 text-center text-white"><span className="text-red-600">SYSTEM</span> FEATURES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Real-time Leaderboard", icon: Activity, desc: "Live tracking of all active teams and their current status." },
              { title: "Role-Based Access", icon: Lock, desc: "Distinct dashboards for Teams, Coordinators, and the Game Master." },
              { title: "Task Verification", icon: CheckCircle, desc: "Automated and manual verification pipelines for submission integrity." },
              { title: "Power Shop", icon: Zap, desc: "Purchase special abilities to gain advantages or hinder opponents." },
              { title: "Secure Auth", icon: Shield, desc: "JWT-based authentication with encrypted communication channels." },
              { title: "Global Notifications", icon: Bell, desc: "Instant alerts for game events, purges, and bonus rounds." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl hover:border-red-600/50 transition-colors group">
                <feature.icon className="w-12 h-12 text-zinc-600 group-hover:text-red-500 mb-6 transition-colors" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Developer Section */}
      <section id="about-dev" className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold text-white">Behind The Code</h2>
            <div className="w-20 h-1 bg-red-600"></div>
            <h3 className="text-2xl text-white font-medium">Aditya Yadav</h3>
            <p className="text-red-500 font-mono font-bold tracking-wide">SECRETARY OF SAIGE</p>
            <p className="text-zinc-400 leading-relaxed">
              Architect of the Culling Games Platform. Passionate about building robust, scalable systems 
              that challenge the status quo. 
            </p>
            
            <div className="flex gap-4 pt-4">
              <a href="https://www.linkedin.com/in/aditya1610" target="_blank" rel="noreferrer" className="p-3 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-blue-600 transition-all">
                <Linkedin size={24} />
              </a>
              <a href="https://github.com/Aadityya07" target="_blank" rel="noreferrer" className="p-3 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-black border border-transparent hover:border-zinc-700 transition-all">
                <Github size={24} />
              </a>
              <a href="https://www.instagram.com/aadityya_06/" target="_blank" rel="noreferrer" className="p-3 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-pink-600 transition-all">
                <Instagram size={24} />
              </a>
              <a href="mailto:aditya.yadav.07.in@gmail.com" className="p-3 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-red-600 transition-all">
                <Mail size={24} />
              </a>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-[50px] opacity-20 rounded-full"></div>
              <div className="relative bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center w-full max-w-sm">
                <Code className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <p className="text-white font-mono text-sm mb-4">"Code is power. Wield it wisely."</p>
                <div className="bg-black p-4 rounded font-mono text-xs text-left text-green-500">
                  <p>$ git commit -m "Initial Commit"</p>
                  <p>$ git push origin master</p>
                  <p className="text-zinc-500 mt-2">// Ready for deployment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-zinc-900 py-10 text-center text-zinc-600 z-10 w-full">
        <p>© 2026 Culling Games Platform. Developed by Aditya Yadav.</p>
      </footer>
    </div>
  );
};

export default LandingPage;