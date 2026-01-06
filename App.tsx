
import React, { useState, useCallback, useRef, useEffect } from 'react';
import HowItWorksPage from './HowItWorksPage';

// --- TYPES ---
type PixelValue = boolean;

interface StripCodeLine {
  grid: PixelValue[][];
  width: number;
  height: number;
  sequenceIndex: number;
  totalSequences: number;
}

interface GeneratorOutput {
  lines: StripCodeLine[];
}

// --- REED-SOLOMON COMPACT MATH (GF 2^8) ---
class ReedSolomon {
  private exp: number[] = new Array(512);
  private log: number[] = new Array(256);

  constructor() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      this.exp[i] = x;
      this.log[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
    }
    for (let i = 255; i < 512; i++) this.exp[i] = this.exp[i - 255];
  }

  private mul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.exp[this.log[a] + this.log[b]];
  }

  public encode(message: number[], eccCount: number): number[] {
    const generator = new Array(eccCount).fill(0);
    generator[0] = 1;
    for (let i = 0; i < eccCount; i++) {
      for (let j = 0; j < eccCount; j++) {
        generator[j] = this.mul(generator[j], this.exp[i]) ^ (j < eccCount - 1 ? generator[j + 1] : 0);
      }
    }

    const polynomial = new Array(message.length + eccCount).fill(0);
    for (let i = 0; i < message.length; i++) polynomial[i] = message[i];

    for (let i = 0; i < message.length; i++) {
      const coef = polynomial[i];
      if (coef !== 0) {
        for (let j = 0; j < eccCount; j++) {
          polynomial[i + j] ^= this.mul(coef, generator[j]);
        }
      }
    }
    
    // Return only the ECC suffix
    return polynomial.slice(message.length);
  }
}
const rsEncoder = new ReedSolomon();

// --- LOGIC (StripCode v8) ---
const generatePattern = async (input: string): Promise<GeneratorOutput> => {
  const HEIGHT = 8;
  const MAX_CHARS = 40; 
  
  const chunks = [];
  for (let i = 0; i < input.length; i += MAX_CHARS) chunks.push(input.slice(i, i + MAX_CHARS));

  const lines = chunks.map((chunk, index) => {
    // 1. Prepare Data & ECC
    const dataBytes = chunk.split('').map(c => c.charCodeAt(0));
    
    // Calculate ECC count: 25% of length, min 4 bytes
    const eccCount = Math.max(4, Math.ceil(dataBytes.length * 0.25));
    const eccBytes = rsEncoder.encode(dataBytes, eccCount);
    
    // 2. Calculate Widths
    const leftFinderW = 3;
    const leftQuietW = 1;
    const metaW = 4;
    const dataW = dataBytes.length * 2;
    const eccW = eccBytes.length * 2; // ECC is also split-byte encoded
    const rightQuietW = 1;
    const rightFinderW = 2;

    const totalWidth = leftFinderW + leftQuietW + metaW + dataW + eccW + rightQuietW + rightFinderW;

    // 3. Initialize Grid
    const grid = Array.from({ length: HEIGHT }, () => Array(totalWidth).fill(false));
    let x = 0;

    // --- A. LEFT FINDER (v6 Logic) ---
    for (let i = 0; i < leftFinderW; i++) {
        for (let y = 0; y < HEIGHT; y++) grid[y][x + i] = (y <= 2 || y >= 5);
    }
    x += leftFinderW;

    // --- B. LEFT QUIET ---
    x += leftQuietW;

    // --- C. HELPER: WriteColumn (With v6.1 Phase Shift) ---
    const writeColumn = (val: number, isMeta: boolean) => {
        grid[0][x] = x % 2 === 0; // Top Clock
        grid[HEIGHT - 1][x] = x % 2 !== 0; // Bottom Clock (Phase Shifted)

        for (let b = 0; b < 4; b++) {
            const bit = (val >> b) & 1;
            let pixelOn = (bit === 1);
            if (!isMeta) { // Masking
                 if (((1 + b) + x) % 2 === 0) pixelOn = !pixelOn;
            }
            grid[1 + b][x] = pixelOn;
        }
        
        let p = true; // Parity/Row 5
        if (!isMeta && (5 + x) % 2 === 0) p = !p;
        grid[5][x] = p;

        let s = false; // Sep/Row 6
        if (!isMeta && (6 + x) % 2 === 0) s = !s;
        grid[6][x] = s;

        x++;
    };

    // --- D. WRITE SECTIONS ---
    
    // 1. Meta (Row Index)
    const rowIdx = index + 1;
    writeColumn(rowIdx & 0x0F, true);
    writeColumn((rowIdx >> 4) & 0x0F, true);

    // 2. Meta (Total Rows)
    const totalRows = chunks.length;
    writeColumn(totalRows & 0x0F, true);
    writeColumn((totalRows >> 4) & 0x0F, true);

    // 3. PAYLOAD (The Text)
    for (let val of dataBytes) {
        writeColumn(val & 0x0F, false);
        writeColumn((val >> 4) & 0x0F, false);
    }

    // 4. ECC BYTES (The Armor - Rendered exactly like data)
    for (let val of eccBytes) {
        writeColumn(val & 0x0F, false);
        writeColumn((val >> 4) & 0x0F, false);
    }

    // --- E. RIGHT QUIET ---
    x += rightQuietW;

    // --- F. RIGHT FINDER (v7 Logic: Logic/EOF Markers) ---
    const isLastRow = (index + 1) === chunks.length;
    const isEven = (index + 1) % 2 === 0;
    
    let leftBit = isLastRow ? true : (isEven ? true : false);
    let rightBit = isLastRow ? true : (isEven ? false : true);

    for (let i = 0; i < rightFinderW; i++) {
        const centerVal = (i === 0) ? leftBit : rightBit;
        for (let y = 0; y < HEIGHT; y++) {
            if (y <= 1 || y >= 6) grid[y][x + i] = true;
            else if (y === 3 || y === 4) grid[y][x + i] = centerVal;
        }
    }

    return { 
        grid, 
        width: totalWidth, 
        height: HEIGHT, 
        sequenceIndex: rowIdx,
        totalSequences: totalRows 
    };
  });

  return { lines };
};

// --- COMPONENT ---
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'generator' | 'docs'>('generator');
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<GeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true); 
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 6; 

  // --- AUTO GENERATION LOOP ---
  useEffect(() => {
    const generate = async () => {
      if (!inputText) {
        setOutput(null);
        setError(null);
        return;
      }
      
      setLoading(true);
      try {
        const result = await generatePattern(inputText);
        setOutput(result);
        setError(null);
      } catch (err) {
        setError('An error occurred while generating the StripCode.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(generate, 50); // 50ms debounce
    return () => clearTimeout(timeoutId);
  }, [inputText]);

  // --- DRAWING LOOP ---
  useEffect(() => {
    if (!output || !canvasRef.current || currentView !== 'generator') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { lines } = output;
    if (lines.length === 0) return;

    // Layout Configuration
    const LINE_SPACING = 2; 
    const PADDING = 4; 

    // Calculate dimensions
    const maxLineWidth = Math.max(...lines.map(l => l.width));
    const totalHeightModules = lines.reduce((acc, line) => acc + line.height, 0) + (Math.max(0, lines.length - 1) * LINE_SPACING);

    canvas.width = (maxLineWidth + (PADDING * 2)) * scale;
    canvas.height = (totalHeightModules + (PADDING * 2)) * scale;

    // 1. Clear background with neutral light gray
    ctx.fillStyle = '#E5E7EB'; // gray-200
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentYOffset = PADDING;

    // 2. Iterate through each line
    lines.forEach((line) => {
        const { grid, width, height } = line;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const posX = (PADDING + x) * scale;
                const posY = (currentYOffset + y) * scale;

                // Draw Fill (Data)
                // If true -> Black, If false -> White
                ctx.fillStyle = grid[y][x] ? '#000000' : '#FFFFFF';
                ctx.fillRect(posX, posY, scale, scale);

                // Draw Border (Debug Grid) ONLY if showGrid is true
                if (showGrid) {
                  ctx.strokeStyle = '#FF0000';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(posX, posY, scale, scale);
                }
            }
        }
        
        // Draw helper label for ECC area (rough approximation for viz)
        if (showGrid) {
            ctx.fillStyle = '#6366F1';
            ctx.font = '8px monospace'; 
        }
        
        currentYOffset += height + LINE_SPACING;
    });

  }, [output, showGrid, currentView]); 

  // --- RENDER VIEW: DOCS ---
  if (currentView === 'docs') {
    return <HowItWorksPage onBack={() => setCurrentView('generator')} />;
  }

  // --- RENDER VIEW: GENERATOR ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
                Strip<span className="text-indigo-400">Code</span>
                </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md font-medium">
                Professional Debug Interface: v8.0.0 (ECC)
            </p>
          </div>

          <button 
            onClick={() => setCurrentView('docs')}
            className="px-6 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all text-xs font-bold uppercase tracking-widest"
          >
            How it works
          </button>
        </header>

        {/* Input Panel */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Data Payload
                </label>
                {loading && (
                    <span className="text-[10px] text-indigo-400 animate-pulse font-mono tracking-widest">PROCESSING STREAM...</span>
                )}
            </div>
            <textarea
              className="w-full min-h-[140px] bg-slate-900/80 rounded-2xl border border-slate-700 p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-lg resize-y"
              placeholder="Type to generate live StripCode..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </section>

        {/* Output Panel with Debug Rendering */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2 flex-wrap gap-2">
            <div className="flex items-center gap-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${showGrid ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  Debug Visualization
                </h3>
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                    showGrid 
                    ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {showGrid ? 'Grid ON' : 'Grid OFF'}
                </button>
            </div>

            {output && (
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-800 text-indigo-400 px-3 py-1 rounded-full font-mono font-bold border border-indigo-500/30">
                  {output.lines.length} {output.lines.length === 1 ? 'SEQUENCE' : 'SEQUENCES'}
                </span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/30">
                  ECC: GF(2^8)
                </span>
              </div>
            )}
          </div>

          <div 
            className="w-full bg-gray-200 rounded-3xl border-4 border-slate-700 shadow-inner overflow-hidden relative min-h-[260px] flex items-center justify-center p-8"
          >
            {output ? (
              <div 
                className="overflow-x-auto w-full max-h-[600px] scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-800/20 py-4"
              >
                <div className="min-w-max flex justify-center px-4">
                  <canvas 
                    ref={canvasRef} 
                    className="shadow-2xl image-render-pixel"
                    style={{ 
                      imageRendering: 'pixelated',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <p className="font-bold text-sm uppercase tracking-widest text-slate-600">Start typing to generate</p>
              </div>
            )}
          </div>

          {/* Legend */}
          {output && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 bg-black border border-slate-500"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">True (Data)</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 bg-white border border-slate-500"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">False (Quiet)</span>
               </div>
               {showGrid && (
                 <div className="flex items-center gap-3">
                   <div className="w-4 h-[1px] bg-red-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Grid Boundary</span>
                 </div>
               )}
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 bg-gray-200 border border-slate-500"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Canvas BG</span>
               </div>
            </div>
          )}
        </section>

        {/* Footer Meta */}
        <footer className="mt-4 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
           <div className="flex items-center gap-4 text-xs font-medium">
             <span>StripCode Analyser</span>
             <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
             <span>v8.0.0 (ECC)</span>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
             Property of Development Sandbox
           </p>
        </footer>
      </div>
      
      {/* Visual Feedback styling */}
      {error && (
        <div className="fixed bottom-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
};

export default App;
