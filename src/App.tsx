import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  ArrowRight, 
  Edit3, 
  Eye, 
  Download,
  ExternalLink,
  Cpu,
  Globe,
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import axios from 'axios';

import { Scene } from './components/Scene';
import { AdsterraAds } from './components/AdsterraAds';
import { generateREADME, RepoInfo } from './services/ai';
import { cn } from './lib/utils';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // Loading States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 500);
          return 100;
        }
        return prev + (Math.random() * 10 + 5);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setShowContent(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await axios.post('/api/analyze-repo', { repoUrl });
      const data = { ...response.data, repoUrl }; // Add repoUrl to info
      setRepoInfo(data);
      
      // Build a rich summary for the context field
      let summary = `Repository: ${data.name}\n`;
      summary += `Full Name: ${data.fullName}\n`;
      summary += `Description: ${data.description || 'No description provided.'}\n`;
      summary += `Stats: ⭐ ${data.stars} | 🍴 ${data.forks} | 📜 ${data.license || 'None'}\n\n`;
      
      if (data.packageJson) {
        summary += `Tech Stack (from package.json):\n`;
        const deps = Object.keys(data.packageJson.dependencies || {}).slice(0, 10);
        if (deps.length) summary += `- Key Dependencies: ${deps.join(', ')}\n`;
        
        const scripts = Object.keys(data.packageJson.scripts || {});
        if (scripts.length) summary += `- Available Scripts: ${scripts.join(', ')}\n`;
        
        if (data.packageJson.version) summary += `- Version: ${data.packageJson.version}\n`;
        summary += `\n`;
      }
      
      summary += `Languages: ${data.languages.join(', ')}\n`;
      summary += `Files: ${data.files}\n\n`;
      
      if (data.existingReadme) {
        summary += `Existing README found. Analyzing for features and usage...\n`;
      }

      setProjectDetails(summary);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze repository');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!projectDetails && !repoInfo) return;
    setIsGenerating(true);
    setError(null);
    setApiKeyMissing(false);
    try {
      const markdown = await generateREADME(projectDetails, repoInfo || undefined);
      setGeneratedMarkdown(markdown || '');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#ec4899', '#ffffff']
      });
      // Scroll to generator output
      document.getElementById('generator-output')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      const msg = err.message || 'Generation failed';
      setError(msg);
      if (msg.includes('API key') || msg.includes('401') || msg.includes('403') || msg.includes('not found')) {
        setApiKeyMissing(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setError(null);
      setApiKeyMissing(false);
    } else {
      setError("API Key selection is not available in this environment. Please set GEMINI_API_KEY in your .env file.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedMarkdown], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "README.md";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-indigo-500/30 bg-[#050505]">
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
          >
            <div className="relative flex flex-col items-center gap-12">
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-8xl logo-text relative"
                >
                  <span className="relative z-10">README<span className="logo-dot">.3D</span></span>
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-50" aria-hidden="true">
                    README<span className="logo-dot">.3D</span>
                  </div>
                </motion.div>
              </div>

              <div className="w-64 md:w-80 space-y-4">
                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">Neural Synthesis</span>
                  <span className="text-[10px] font-mono text-indigo-400/60">{Math.round(loadingProgress)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Background - Always present but hidden behind loader */}
      <div className={cn(
        "fixed inset-0 z-0 transition-opacity duration-1000",
        isLoaded ? "opacity-100" : "opacity-0"
      )}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Overlay Gradient */}
      <div className={cn(
        "fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-black/40 to-black transition-opacity duration-1000",
        isLoaded ? "opacity-100" : "opacity-0"
      )} />

      {/* Glass Header */}
      <nav className={cn(
        "glass-header px-8 py-4 flex items-center justify-between transition-all duration-1000",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      )}>
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-xl logo-text">README<span className="logo-dot">.3D</span></span>
        </div>
        <div className={cn(
          "hidden md:flex items-center gap-8 text-sm font-medium text-white/60 transition-all duration-1000 delay-300",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#generator" className="hover:text-white transition-colors">Generator</a>
          <a href="https://github.com" target="_blank" className="hover:text-white transition-colors flex items-center gap-2">
            <Github className="w-4 h-4" /> Open Source
          </a>
        </div>
        <button 
          onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
          className={cn(
            "px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-indigo-50 transition-all active:scale-95 duration-1000 delay-500",
            showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          Get Started
        </button>
      </nav>

      {/* Main Content */}
      <main className={cn(
        "relative z-10 transition-all duration-1000 delay-700",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-400 mb-4">
              <Sparkles className="w-3 h-3" />
              Next-Gen Documentation
            </div>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] neon-text">
              ELEVATE YOUR<br />REPOSITORY
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-light">
              The world's first immersive 3D README engine. Automate your GitHub documentation workflow with Gemini-powered neural synthesis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button 
                onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/40"
              >
                Start Generating <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="https://github.com" 
                target="_blank"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-lg flex items-center justify-center gap-3"
              >
                <Github className="w-5 h-5" /> View on GitHub
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to explore</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-32">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">ENGINEERED FOR <span className="text-indigo-500">SPEED</span></h2>
            <p className="text-white/40 max-w-xl mx-auto">Everything you need to make your project stand out in the developer ecosystem.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="feature-card hover:bg-white/[0.06] transition-all duration-500 group"
            >
              <div className="feature-icon group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500"><Cpu className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold mb-4">Neural Analysis</h3>
              <p className="text-white/50 leading-relaxed">Our AI doesn't just read code; it understands the soul of your project to write documentation that resonates.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="feature-card hover:bg-white/[0.06] transition-all duration-500 group"
            >
              <div className="feature-icon group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500"><Globe className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold mb-4">3D Immersive UI</h3>
              <p className="text-white/50 leading-relaxed">Why work in 2D? Our immersive environment keeps you focused and inspired while you build your brand.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="feature-card hover:bg-white/[0.06] transition-all duration-500 group"
            >
              <div className="feature-icon group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500"><Sparkles className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold mb-4">Instant Export</h3>
              <p className="text-white/50 leading-relaxed">Copy, download, or edit. Your README is ready for the world the moment you hit generate.</p>
            </motion.div>
          </div>
        </section>

        {/* Generator Section */}
        <section id="generator" className="container mx-auto px-6 py-32">
          <div className="glass-panel p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] -z-10" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-5xl font-bold tracking-tighter">THE <span className="text-indigo-500">ENGINE</span></h2>
                  <p className="text-white/50">Input your details below to begin the neural synthesis.</p>
                </div>

                <div className="space-y-8">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="flex-1">{error}</span>
                      </div>
                      {apiKeyMissing && (
                        <button 
                          onClick={handleOpenKeySelector}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          <Cpu className="w-3 h-3" /> Configure API Key
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">GitHub Repository</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
                      />
                      <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !repoUrl}
                        className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Analyze"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Project Context</label>
                    <textarea 
                      value={projectDetails}
                      onChange={(e) => setProjectDetails(e.target.value)}
                      placeholder="What makes this project special?"
                      className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-pink-500/50 transition-all font-mono text-sm resize-none custom-scrollbar"
                    />
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || (!projectDetails && !repoInfo)}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xl flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20"
                  >
                    {isGenerating ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-6 h-6" /> Generate Masterpiece</>}
                  </button>
                </div>
              </div>

              <div id="generator-output" className="flex flex-col h-full min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/10">
                    <button onClick={() => setEditMode(false)} className={cn("px-4 py-2 rounded-lg text-[10px] font-bold transition-all", !editMode ? "bg-white/10 text-white" : "text-white/40")}>PREVIEW</button>
                    <button onClick={() => setEditMode(true)} className={cn("px-4 py-2 rounded-lg text-[10px] font-bold transition-all", editMode ? "bg-white/10 text-white" : "text-white/40")}>EDITOR</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/10 transition-all">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
                    <button onClick={handleDownload} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/10 transition-all"><Download className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 p-8 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {editMode ? (
                      <motion.textarea
                        key="editor"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        value={generatedMarkdown}
                        onChange={(e) => setGeneratedMarkdown(e.target.value)}
                        className="w-full h-full bg-transparent focus:outline-none font-mono text-sm leading-relaxed resize-none custom-scrollbar"
                      />
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full h-full overflow-y-auto custom-scrollbar markdown-body"
                      >
                        {generatedMarkdown ? <Markdown>{generatedMarkdown}</Markdown> : <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4"><Cpu className="w-16 h-16 stroke-1" /><p className="text-xs font-bold uppercase tracking-widest">Awaiting Synthesis</p></div>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="relative border-t border-white/5 bg-white/[0.01] backdrop-blur-3xl pt-24 pb-12 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent origin-center" 
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="container mx-auto px-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
              <div className="col-span-1 md:col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl logo-text">README<span className="logo-dot">.3D</span></span>
                </div>
                <p className="text-white/40 max-w-sm leading-relaxed">
                  The ultimate open-source documentation engine. Built for developers who value their time and project presentation.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://github.com" target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all group">
                    <Github className="w-5 h-5 text-white/40 group-hover:text-white" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all group">
                    <Globe className="w-5 h-5 text-white/40 group-hover:text-white" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all group">
                    <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white" />
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Platform</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#generator" className="hover:text-white transition-colors">Generator</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Open Source</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">Legal</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms of Service</button></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">License</a></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
              <div className="flex flex-col gap-4">
                <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">© 2026 README.3D — ALL RIGHTS RESERVED</p>
              </div>
              <div className="flex items-center gap-2 text-white/20 text-[10px] uppercase tracking-[0.3em]">
                <span>MADE WITH</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </motion.div>
                <span>BY DEVELOPERS</span>
              </div>
            </div>
          </motion.div>

          {/* Animated Footer Background */}
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-indigo-600/10 to-transparent -z-10" 
          />
        </footer>
      </main>

      {/* Modals */}
      <AdsterraAds />
      <AnimatePresence>
        {(showPrivacy || showTerms) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel max-w-2xl w-full p-8 relative max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => { setShowPrivacy(false); setShowTerms(false); }}
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold mb-6">{showPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h2>
              <div className="prose prose-invert text-white/60">
                <p>This is an open-source project. Your data is handled with care.</p>
                <p>We do not store your repository details or generated markdown on our servers. All processing is done in real-time via the Gemini API.</p>
                <p>By using this tool, you agree to the standard open-source license terms.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
