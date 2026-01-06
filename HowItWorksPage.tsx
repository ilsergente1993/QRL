
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS (Inline SVGs to avoid dependency issues) ---
const Icons = {
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Split: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
  ),
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  )
};

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
    className={`py-20 px-6 max-w-6xl mx-auto ${className}`}
  >
    {children}
  </motion.section>
);

const HowItWorksPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // --- DATA FOR VERTICAL SLICE ---
  const rowData = [
    { id: 0, title: "Clock Track A", desc: "The Sync Master. Always alternates 1-0-1-0 to establish the grid rhythm.", color: "bg-indigo-600" },
    { id: 1, title: "Data Bit 0", desc: "The LSB (Least Significant Bit) of the current 4-bit nibble.", color: "bg-slate-800" },
    { id: 2, title: "Data Bit 1", desc: "The second bit of the payload data.", color: "bg-slate-800" },
    { id: 3, title: "Data Bit 2", desc: "The third bit of the payload data.", color: "bg-slate-800" },
    { id: 4, title: "Data Bit 3", desc: "The MSB (Most Significant Bit) of the current 4-bit nibble.", color: "bg-slate-800" },
    { id: 5, title: "Parity / Aux", desc: "A row dedicated to row-level parity checking or auxiliary metadata.", color: "bg-purple-500" },
    { id: 6, title: "Separator Zone", desc: "Acts as a buffer between the data and the bottom clock track.", color: "bg-slate-200" },
    { id: 7, title: "Clock Track B", desc: "Phase Shifted Sync. Inverted from Row 0 to detect skew/rotation.", color: "bg-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <motion.div 
            animate={{ x: [0, -100] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="flex gap-4 p-4"
          >
             {/* Abstract strip patterns for background */}
             {[...Array(20)].map((_, i) => (
                <div key={i} className="w-8 h-64 bg-black/50 skew-x-12" />
             ))}
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 pt-32">
          <button 
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            <svg className="w-4 h-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Back to Generator
          </button>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6"
          >
            Inside StripCode <span className="text-indigo-600">v8</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl leading-relaxed"
          >
             A deep dive into the <strong>Armored Linear Standard</strong>. Explore the robust, multi-line optical protocol designed for the real world, featuring Reed-Solomon Error Correction and Phase-Shifted Clocking.
          </motion.p>
        </div>
      </div>

      {/* --- 2. HORIZONTAL FLOW --- */}
      <Section className="border-b border-slate-200/60">
        <div className="mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">01. Architecture</h2>
            <h3 className="text-3xl font-bold text-slate-900">The Horizontal Flow Structure</h3>
            <p className="text-slate-500 mt-4 max-w-xl">
                StripCode v8 isn't just a barcode; it's a data packet. Data flows linearly from the anchor to the terminator, protected by math.
            </p>
        </div>

        <div className="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-indigo-200">
            <motion.div 
                className="flex items-stretch min-w-[800px] h-32 gap-1 font-mono text-xs font-bold"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {/* BLOCKS */}
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-16 bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center rounded-l-lg shadow-lg z-10">
                    <span className="text-[10px] opacity-50">START</span>
                    Left Finder
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-8 bg-slate-100 border-y border-slate-300 flex items-center justify-center text-slate-300">
                    Q
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-24 bg-indigo-100 text-indigo-700 border-y border-indigo-200 flex flex-col items-center justify-center p-2 text-center">
                    Metadata
                    <span className="text-[9px] font-normal opacity-75">Row ID / Total</span>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="flex-1 bg-slate-800 text-slate-400 border-y border-slate-700 flex items-center justify-center p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
                    <span className="relative z-10 group-hover:scale-110 transition-transform">DATA PAYLOAD (MASKED)</span>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-32 bg-emerald-100 text-emerald-800 border-y border-emerald-200 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 rotate-12 -mr-4 -mt-2">
                        <Icons.Shield />
                    </div>
                    ECC
                    <span className="text-[9px] font-normal opacity-75">Reed-Solomon</span>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-8 bg-slate-100 border-y border-slate-300 flex items-center justify-center text-slate-300">
                    Q
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} className="w-16 bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center rounded-r-lg shadow-lg z-10">
                    <span className="text-[10px] opacity-50">END</span>
                    Right Finder
                </motion.div>
            </motion.div>
        </div>
      </Section>

      {/* --- 3. KEY BLOCKS --- */}
      <div className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
                <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">02. Orientation</h2>
                <h3 className="text-3xl font-bold text-slate-900">Asymmetric Finders</h3>
                <p className="text-slate-500 mt-4 max-w-xl">
                    The Left and Right finders are geometrically distinct. The scanner knows the orientation of the strip instantly based on these anchors.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Left Finder Card */}
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl relative overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Left Finder</h4>
                            <p className="text-sm text-slate-500">The "Solid Wall"</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            {/* Mini visual of Left Finder */}
                            <div className="grid grid-cols-3 gap-0.5 w-12 h-12">
                                <div className="bg-slate-900 h-full w-full col-span-3"></div>
                                <div className="bg-slate-900 h-full w-full col-span-3"></div>
                                <div className="bg-slate-900 h-full w-full col-span-3"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600">
                        A solid 3x8 block of pixels (with top/bottom solid rows). This heavy density acts as the primary visual anchor for the CV algorithm to latch onto.
                    </p>
                </div>

                {/* Right Finder Card */}
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl relative overflow-hidden">
                     <div className="flex items-start justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Right Finder</h4>
                            <p className="text-sm text-slate-500">The "Logic Gate"</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            {/* Visual of Right Finder Logic */}
                             <div className="flex gap-1 w-12 h-12">
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="h-1/3 bg-slate-900"></div>
                                    <div className="h-1/3 bg-indigo-500 animate-pulse"></div>
                                    <div className="h-1/3 bg-slate-900"></div>
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="h-1/3 bg-slate-900"></div>
                                    <div className="h-1/3 bg-slate-200"></div>
                                    <div className="h-1/3 bg-slate-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                            <span className="text-slate-500">EVEN ROW</span>
                            <span className="font-bold flex gap-1"><span className="text-indigo-600">■</span><span className="text-slate-300">□</span></span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                            <span className="text-slate-500">ODD ROW</span>
                            <span className="font-bold flex gap-1"><span className="text-slate-300">□</span><span className="text-indigo-600">■</span></span>
                        </div>
                         <div className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-100">
                            <span className="text-indigo-700 font-bold">LAST ROW (STOP)</span>
                            <span className="font-bold flex gap-1"><span className="text-indigo-600">■</span><span className="text-indigo-600">■</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- 4. VERTICAL SLICE (INTERACTIVE) --- */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">03. Anatomy</h2>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">The Vertical 8-Bit Slice</h3>
                <p className="text-slate-500 mb-8">
                    Hover over the pixel column to understand the function of each row. Every vertical slice carries half a byte of data, framed by clock tracks.
                </p>

                {/* Info Panel */}
                <div className="h-40 relative">
                    <AnimatePresence mode='wait'>
                        {hoveredRow !== null ? (
                            <motion.div 
                                key={hoveredRow}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`w-3 h-3 rounded-full ${rowData[hoveredRow].color}`}></span>
                                    <h4 className="font-bold text-lg text-slate-900 font-mono">Row {hoveredRow}: {rowData[hoveredRow].title}</h4>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    {rowData[hoveredRow].desc}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="default"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-4 text-slate-400 h-full border-2 border-dashed border-slate-200 rounded-xl p-6"
                            >
                                <Icons.ArrowRight />
                                <span className="font-medium">Hover the stack to inspect details</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
             </div>

             {/* Interactive Visual */}
             <div className="flex justify-center">
                 <div className="relative bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-indigo-500/20">
                    <div className="flex flex-col gap-1 w-24">
                        {rowData.map((row) => (
                            <motion.div
                                key={row.id}
                                onMouseEnter={() => setHoveredRow(row.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                                whileHover={{ scale: 1.05, x: 10 }}
                                className={`
                                    h-8 w-full rounded cursor-crosshair transition-colors duration-200
                                    flex items-center justify-center
                                    ${hoveredRow === row.id ? row.color : 'bg-slate-700 hover:bg-slate-600'}
                                    ${(row.id === 0 || row.id === 7) && hoveredRow !== row.id ? 'bg-slate-500' : ''}
                                `}
                            >
                                <span className="text-[10px] font-mono text-white/50 pointer-events-none">R{row.id}</span>
                            </motion.div>
                        ))}
                    </div>
                    {/* Decorative bracket */}
                    <div className="absolute top-8 bottom-8 -left-4 w-4 border-l-2 border-y-2 border-slate-500/30 rounded-l-lg"></div>
                 </div>
             </div>
        </div>
      </Section>

      {/* --- 5. HIDDEN LOGIC CARDS --- */}
      <div className="bg-slate-100 py-24">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">04. The "Hidden" Layer</h2>
                 <h3 className="text-3xl font-bold text-slate-900">Mathematical Robustness</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
                >
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                        <Icons.Split />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Split-Byte Encoding</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        To fit the slim 8px vertical profile, standard ASCII characters (8-bit) are split into two consecutive 4-bit columns. This doubles the width but ensures extremely low vertical height requirements.
                    </p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
                >
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                        <Icons.Grid />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Optical XOR Masking</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        Data isn't written raw. It is XORed with a coordinate-based pattern. This prevents large areas of solid white or black (which confuse cameras) and ensures a 50% average pixel density.
                    </p>
                </motion.div>

                 {/* Feature 3 */}
                 <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
                >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
                        <Icons.Shield />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Reed-Solomon Armor</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        v8 introduces Galois Field GF(2^8) error correction. We add 25% redundant bytes to the end of the stream. If the strip is torn or stained, the math reconstructs the missing pixels.
                    </p>
                </motion.div>
            </div>
         </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center">
        <p className="text-slate-400 text-sm font-medium">StripCode v8 Specification &bull; Designed for Optical Resilience</p>
      </footer>

    </div>
  );
};

export default HowItWorksPage;
