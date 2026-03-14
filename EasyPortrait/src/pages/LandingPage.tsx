import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Grid3x3, ArrowRight, Check, Wand2, Crop, FileText, Sun, Contrast as ContrastIcon, Palette, Globe, Shield, ChevronDown, ChevronRight, Lightbulb, Lock, Eye, Zap, Monitor, Printer, ExternalLink } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import AppSwitcher from '../components/AppSwitcher';

const FaqItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition"
      {...{ 'aria-expanded': isOpen }}
    >
      <span className="font-medium text-gray-900 dark:text-slate-100 pr-4">{question}</span>
      <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-5 pb-4 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);
import samplePhoto1 from '../resources/sample-portrait-1.jpeg';
import samplePhoto2 from '../resources/sample-portrait-2.jpeg';
import samplePhoto3 from '../resources/sample-portrait-3.jpeg';
import samplePhoto4 from '../resources/sample-portrait-4.jpeg';
import collagePhoto from '../resources/abced.jpeg';
import homePhotoGuide from '../resources/387831C9-07A3-4837-AB44-F7D3CFDA983F_1_201_a.jpeg';
import passportUSA from '../resources/USA.png';
import passportIndia from '../resources/india.png';
import passportCanada from '../resources/canada.png';
import passportAustralia from '../resources/australian.png';
import passportChina from '../resources/china.png';
import passportFrance from '../resources/france.png';
import passportGermany from '../resources/german.png';
import passportNetherlands from '../resources/netherlands.png';
import passportNorway from '../resources/norway.png';
import passportSwitzerland from '../resources/swiss.png';

const BG_DEMO_COLORS = [
  { color: '#F87171', label: 'Red' },
  { color: '#86EFAC', label: 'Green' },
  { color: '#BFDBFE', label: 'Blue' },
  { color: '#D1D5DB', label: 'Gray' },
  { color: '#FFFFFF', label: 'White' },
];

const SHEET_SIZES = [
  { label: 'A4', dims: '210×297mm', w: 210, h: 297, cols: 4, rows: 6 },
  { label: '4×6"', dims: '102×152mm', w: 102, h: 152, cols: 2, rows: 3 },
  { label: '5×7"', dims: '127×178mm', w: 127, h: 178, cols: 2, rows: 4 },
];

const ADJUST_DEMO_ITEMS = [
  { icon: Sun, label: 'Brightness' },
  { icon: ContrastIcon, label: 'Contrast' },
  { icon: Palette, label: 'Saturation' },
];

export const LandingPage: React.FC = () => {
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [activeCropIndex, setActiveCropIndex] = useState(0);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [adjustSliderPos, setAdjustSliderPos] = useState(0);
  const [activeAdjustIndex, setActiveAdjustIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const CROP_SIZES = [
    { name: 'US / India', dims: '2×2″', w: 1, h: 1, flag: '🇺🇸' },
    { name: 'Canada', dims: '50×70mm', w: 50, h: 70, flag: '🇨🇦' },
    { name: 'Japan', dims: '45×45mm', w: 1, h: 1, flag: '🇯🇵' },
    { name: 'EU / UK', dims: '35×45mm', w: 35, h: 45, flag: '🇪🇺' },
    { name: 'China', dims: '33×48mm', w: 33, h: 48, flag: '🇨🇳' },
  ];

  const [transparentUrl, setTransparentUrl] = useState<string | null>(null);
  const [bgRemovalLoading, setBgRemovalLoading] = useState(false);
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);
  const hasStartedProcessing = useRef(false);

  // Auto-cycle colors
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % BG_DEMO_COLORS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle crop sizes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCropIndex((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle sheet sizes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSheetIndex((prev) => (prev + 1) % SHEET_SIZES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync adjustment pill cycling with before/after slider animation
  useEffect(() => {
    const CYCLE_MS = 2000; // 2s per adjustment
    let frame: number;
    let cycleStart = performance.now();
    let currentIndex = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - cycleStart;
      
      if (elapsed >= CYCLE_MS) {
        // Move to next pill
        currentIndex = (currentIndex + 1) % ADJUST_DEMO_ITEMS.length;
        setActiveAdjustIndex(currentIndex);
        cycleStart = timestamp;
        setAdjustSliderPos(0);
      } else {
        // Animate slider from 0 to 100 within the cycle
        const progress = elapsed / CYCLE_MS;
        setAdjustSliderPos(progress * 100);
      }
      
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Process background removal on mount — with localStorage cache
  useEffect(() => {
    if (hasStartedProcessing.current) return;
    hasStartedProcessing.current = true;

    const CACHE_KEY = 'easyportrait_transparent_v2';

    const processImage = async () => {
      // 1. Try loading from cache first (instant)
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const res = await fetch(cached);
          const blob = await res.blob();
          setTransparentUrl(URL.createObjectURL(blob));
          return; // Done — no spinner, no delay
        }
      } catch {
        // Cache miss or corrupt — proceed to process
      }

      // 2. Process in background
      setBgRemovalLoading(true);
      setBgRemovalError(null);
      try {
        const response = await fetch(samplePhoto1);
        const imageBlob = await response.blob();

        const resultBlob = await removeBackground(imageBlob, {
          output: { format: 'image/png' as const, quality: 1 },
        });

        const url = URL.createObjectURL(resultBlob);
        setTransparentUrl(url);

        // Cache as data URL for next visit
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            localStorage.setItem(CACHE_KEY, reader.result as string);
          } catch {
            // localStorage full — ignore
          }
        };
        reader.readAsDataURL(resultBlob);
      } catch (err) {
        console.error('Background removal failed:', err);
        setBgRemovalError('Failed');
      } finally {
        setBgRemovalLoading(false);
      }
    };

    processImage();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-900">
      <AppSwitcher />

      {/* Right-side red ribbons */}
      <div className="fixed right-0 top-1/3 z-40 hidden lg:flex flex-col gap-2">
        {[
          'Instant Passport Photo',
          '50+ Countries Supported',
          'Ready in Seconds',
          'Print-Ready Sizes',
          '100% Browser-Based',
        ].map((text, i) => (
          <div
            key={i}
            className="relative bg-red-600 text-white text-xs font-semibold px-4 py-2 pr-3 pl-5 shadow-lg"
            style={{
              clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)',
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700">
        {/* Top row: Logo + flags */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900 dark:text-slate-100">WithSwag</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-lg" title="Supports 50+ countries">
              <span>🇺🇸</span><span>🇪🇺</span><span>🇬🇧</span><span>🇮🇳</span><span>🇨🇦</span><span>🇦🇺</span><span>🇨🇳</span><span>🇯🇵</span>
            </div>
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-slate-400 font-medium">50+ countries supported</span>
          </div>
        </div>
        {/* Bottom row: Breadcrumbs + Nav links */}
        <div className="border-t border-gray-100 dark:border-slate-700/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 font-medium flex-shrink-0">
              <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">WithSwag</a>
              <ChevronRight size={14} className="text-gray-400 dark:text-slate-600" />
              <span className="text-gray-900 dark:text-slate-100">Portrait Photo</span>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Country Guide', href: '#country-guide' },
                { label: 'Compliance', href: '#compliance' },
                { label: 'Privacy', href: '#privacy' },
                { label: 'How-To', href: '#home-photo' },
                { label: 'Gear', href: '#gear' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Pricing', href: '#pricing' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary/10 text-primary dark:bg-indigo-900/30 dark:text-indigo-300 border border-primary/20 dark:border-indigo-700/40 hover:bg-primary hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-center">

          {/* Left Column: Cards 1 & 2 */}
          <div className="flex flex-col gap-4 md:gap-6 order-2 md:order-1 md:min-w-[380px]">
            {/* Card 1: AI Background Removal */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-15 blur-lg" />
              <div className="relative bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl shadow-lg px-7 py-6">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-[72px] h-[92px] rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700">
                      <img src={samplePhoto1} alt="Original" className="w-full h-full object-cover" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <div
                      className="w-[72px] h-[92px] rounded-lg shadow-sm border border-primary/30 overflow-hidden relative transition-colors duration-700 ease-in-out"
                      style={{ backgroundColor: BG_DEMO_COLORS[activeBgIndex].color }}
                    >
                      {bgRemovalLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <img
                        src={transparentUrl || samplePhoto1}
                        alt={transparentUrl ? 'New background' : 'Processing...'}
                        className="absolute inset-0 w-full h-full object-cover z-[1]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {BG_DEMO_COLORS.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveBgIndex(i)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            i === activeBgIndex
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${c.color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                            style={{ backgroundColor: c.color }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">AI Background Removal</span>
                  <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full">NEW</span>
                </div>
              </div>
            </div>

            {/* Card 2: Smart Crop */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-15 blur-lg" />
              <div className="relative bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl shadow-lg px-7 py-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-36 h-36 bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    <img src={samplePhoto2} alt="Full photo" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative rounded overflow-hidden shadow-md border-2 border-primary transition-all duration-700 ease-in-out"
                        style={{
                          width: `${Math.min(120, 120 * (CROP_SIZES[activeCropIndex].w / Math.max(CROP_SIZES[activeCropIndex].w, CROP_SIZES[activeCropIndex].h)))}px`,
                          height: `${Math.min(120, 120 * (CROP_SIZES[activeCropIndex].h / Math.max(CROP_SIZES[activeCropIndex].w, CROP_SIZES[activeCropIndex].h)))}px`,
                        }}
                      >
                        <img src={samplePhoto2} alt="Cropped" className="w-full h-full object-cover" />
                        {['-top-0.5 -left-0.5', '-top-0.5 -right-0.5', '-bottom-0.5 -left-0.5', '-bottom-0.5 -right-0.5'].map((pos, i) => (
                          <div key={i} className={`absolute ${pos} w-2.5 h-2.5 bg-primary rounded-sm`} />
                        ))}
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-center py-0.5 text-xs font-bold">
                          {CROP_SIZES[activeCropIndex].flag} {CROP_SIZES[activeCropIndex].dims}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {CROP_SIZES.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCropIndex(i)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            i === activeCropIndex
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span>{size.flag}</span>
                          <span>{size.dims}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Crop className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-semibold text-secondary">Smart Crop — Any Country, Any Size, Custom Dimensions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Text Block */}
          <div className="order-first md:order-2 text-center max-w-lg mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
              Create Professional Passport Photos
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8">
              Resize, crop, and create passport-sized photos meeting international standards. All processing happens on your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/editor/single"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg font-semibold transition"
              >
                <Camera className="h-5 w-5" />
                Single Photo
              </Link>
              <Link
                to="/editor/collage"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-purple-600 text-white rounded-lg font-semibold transition"
              >
                <Grid3x3 className="h-5 w-5" />
                Create Collage
              </Link>
            </div>


          </div>

          {/* Right Column: Cards 3 & 4 */}
          <div className="flex flex-col gap-4 md:gap-6 order-3 md:min-w-[380px]">
            {/* Card 3: Sheet Sizes */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-primary rounded-2xl opacity-15 blur-lg" />
              <div className="relative bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl shadow-lg px-7 py-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-36 h-36 bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                    {(() => {
                      const sheet = SHEET_SIZES[activeSheetIndex];
                      const aspect = sheet.w / sheet.h;
                      const maxH = 120;
                      const sheetH = maxH;
                      const sheetW = maxH * aspect;
                      return (
                        <div
                          className="relative bg-white border-2 border-gray-300 rounded-sm shadow-sm transition-all duration-700 ease-in-out"
                          style={{ width: `${sheetW}px`, height: `${sheetH}px` }}
                        >
                          <div
                            className="absolute inset-1 grid gap-[2px] transition-all duration-700"
                            style={{
                              gridTemplateColumns: `repeat(${sheet.cols}, 1fr)`,
                              gridTemplateRows: `repeat(${sheet.rows}, 1fr)`,
                            }}
                          >
                            {Array.from({ length: sheet.cols * sheet.rows }).map((_, i) => (
                              <div key={i} className="rounded-[1px] overflow-hidden border border-primary/20">
                                <img src={samplePhoto3} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="absolute -bottom-0.5 inset-x-0 bg-black/50 text-white text-center py-0.5 text-[10px] font-bold rounded-b-sm">
                            {sheet.label}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {SHEET_SIZES.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSheetIndex(i)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            i === activeSheetIndex
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className="text-xs">📄</span>
                          <span>{size.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-400 mt-2">{SHEET_SIZES[activeSheetIndex].cols * SHEET_SIZES[activeSheetIndex].rows} photos per sheet</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">Custom Sheet Size — Print Ready</span>
                </div>
              </div>
            </div>

            {/* Card 4: Photo Adjustments */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-15 blur-lg" />
              <div className="relative bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl shadow-lg px-7 py-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    <img
                      src={samplePhoto4}
                      alt="Photo adjustment demo"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        filter: activeAdjustIndex === 0
                          ? `brightness(${1 + 0.3 * (adjustSliderPos / 100)})`
                          : activeAdjustIndex === 1
                          ? `contrast(${1 + 0.4 * (adjustSliderPos / 100)})`
                          : `saturate(${1 + 0.5 * (adjustSliderPos / 100)})`,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {ADJUST_DEMO_ITEMS.map((item, i) => (
                        <button
                          key={i}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            i === activeAdjustIndex ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-500">Photo Adjustments — Fine-Tune Your Look</span>
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">NEW</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Country-Specific Passport Photo Guide */}
      <section id="country-guide" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Globe className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Passport Photo Requirements by Country</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Each country enforces strict photo standards. A wrong size, background, or head position means rejection. Here are the exact specs you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { country: 'United States', flag: '🇺🇸', img: passportUSA, size: '2 × 2 in (51 × 51 mm)', head: 'Head height: 25–35 mm', bg: 'Plain white', extra: 'No glasses since 2016. Head must be centered. Taken within last 6 months.', docUrl: 'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html', docLabel: 'U.S. Department of State' },
              { country: 'India', flag: '🇮🇳', img: passportIndia, size: '2 × 2 in (51 × 51 mm)', head: 'Face covers 70–80% of frame', bg: 'Plain white', extra: 'Ears must be visible. No border. Matte or glossy finish accepted.', docUrl: 'https://www.passportindia.gov.in/bitstream/123456789/225/1/Photo-Spec.pdf', docLabel: 'Passport Seva (MEA)' },
              { country: 'Canada', flag: '🇨🇦', img: passportCanada, size: '50 × 70 mm', head: 'Face height: 31–36 mm', bg: 'Plain white or light gray', extra: 'Neutral expression, mouth closed. Crown to chin must be 31–36 mm. Taken within 12 months.', docUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html', docLabel: 'Government of Canada (IRCC)' },
              { country: 'Australia', flag: '🇦🇺', img: passportAustralia, size: '35 × 45 mm', head: 'Head height: 32–36 mm', bg: 'Plain white', extra: 'No head tilt. Chin to crown 32–36 mm. Photo must be less than 6 months old. No digital alterations.', docUrl: 'https://www.passports.gov.au/getting-passport-how-it-works/photo-guidelines', docLabel: 'Australian Passport Office (DFAT)' },
              { country: 'China', flag: '🇨🇳', img: passportChina, size: '33 × 48 mm', head: 'Head height: 28–33 mm', bg: 'Plain white', extra: 'Both ears visible. No hair covering forehead. Head width 15–22 mm. Taken within 6 months.', docUrl: 'https://www.visaforchina.cn/', docLabel: 'China Visa Application Center' },
              { country: 'France', flag: '🇫🇷', img: passportFrance, size: '35 × 45 mm', head: 'Face height: 32–36 mm', bg: 'Plain light gray or light blue', extra: 'Mouth closed, no smile. Face must be 70–80% of photo. No glasses. ISO/IEC 19794-5 compliant.', docUrl: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10619', docLabel: 'Service-Public.fr' },
              { country: 'Germany', flag: '🇩🇪', img: passportGermany, size: '35 × 45 mm', head: 'Face height: 32–36 mm', bg: 'Plain light gray', extra: 'Biometric standard required. Neutral expression. Eyes open, looking straight at camera. Sharp focus, no shadows.', docUrl: 'https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/moderne-verwaltung/ausweise/fotomustertafel.html', docLabel: 'Federal Ministry of the Interior (BMI)' },
              { country: 'Netherlands', flag: '🇳🇱', img: passportNetherlands, size: '35 × 45 mm', head: 'Face height: 26–30 mm', bg: 'Plain light gray', extra: 'No glasses. Both ears visible. Uniform lighting, no shadows on face or background. Recent photo (< 6 months).', docUrl: 'https://www.government.nl/topics/identification-documents/requirements-for-photos', docLabel: 'Rijksoverheid (Government.nl)' },
              { country: 'Norway', flag: '🇳🇴', img: passportNorway, size: '35 × 45 mm', head: 'Face height: 30–36 mm', bg: 'Plain light gray', extra: 'Straight-on view, neutral expression. No head coverings except religious. High resolution, no pixelation.', docUrl: 'https://www.politiet.no/en/services/passport-and-id-card/photo-requirements/', docLabel: 'Politiet (Norwegian Police)' },
              { country: 'Switzerland', flag: '🇨🇭', img: passportSwitzerland, size: '35 × 45 mm', head: 'Face height: 30–36 mm', bg: 'Plain light gray', extra: 'ICAO compliant. Eyes clearly visible. No reflections on skin. Taken within 12 months. Print on photo-quality paper.', docUrl: 'https://www.fedpol.admin.ch/fedpol/en/home/pass---identitaetskarte/pass/pass-id-erfassen.html', docLabel: 'Federal Office of Police (fedpol)' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-indigo-500 transition hover:shadow-lg group">
                <div className="aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={item.img}
                    alt={`${item.country} passport photo example`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{item.flag}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{item.country}</h3>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-primary font-semibold">{item.size}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">{item.head}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Background: {item.bg}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.extra}</p>
                  <a
                    href={item.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 mt-3 px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:border-primary transition-all"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Official Docs — {item.docLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
            Also supports Singapore, Malaysia, Japan, South Korea, Brazil, Mexico, UK, and 40+ more countries.
          </p>
        </div>
      </section>

      {/* Compliance Standards */}
      <section id="compliance" className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Official Compliance Standards</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Passport photos are rejected for small mistakes. Our tool helps you meet every requirement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Correct Dimensions', desc: 'Automatically crops to the exact pixel dimensions required by each country. US 2×2", EU 35×45mm, and more.', icon: Crop },
              { title: 'White Background', desc: 'AI removes your background and replaces it with the correct color — plain white, light gray, or blue as needed.', icon: Wand2 },
              { title: 'Even Lighting', desc: 'Adjust brightness, contrast, and face lighting to eliminate shadows and ensure even illumination across your face.', icon: Sun },
              { title: 'Neutral Expression', desc: 'Tips and guidelines to help you capture the right expression — mouth closed, eyes open, facing forward.', icon: Eye },
              { title: 'High Resolution', desc: 'Output at 300 DPI or 600 DPI for sharp, print-ready results that meet government quality standards.', icon: Zap },
              { title: 'Proper Framing', desc: 'Smart crop guides with preset country sizes or fully custom dimensions — set any width and height in mm for total flexibility.', icon: Camera },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <item.icon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-12">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: 'Easy Upload',
                description: 'Drag and drop your photo or use your camera. Supports JPG, PNG, and WEBP.',
              },
              {
                icon: Wand2,
                title: 'AI Background Removal',
                description: 'Remove and replace photo backgrounds with AI. Choose white, blue, red, or any color.',
                highlight: true,
              },
              {
                icon: Grid3x3,
                title: 'Multiple Standards',
                description: 'Supports passport sizes for Australia, Canada, EU, US, India, and more.',
              },
              {
                icon: Check,
                title: 'Professional Quality',
                description: 'Configurable DPI settings (150, 300, 600) for optimal print quality.',
              },
            ].map((feature, idx) => (
              <div key={idx} className={`p-6 rounded-lg border transition ${
                (feature as any).highlight
                  ? 'border-primary bg-primary/5 dark:bg-indigo-900/20 hover:bg-primary/10 ring-1 ring-primary/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-indigo-500'
              }`}>
                <feature.icon className={`h-10 w-10 mb-4 ${
                  (feature as any).highlight ? 'text-primary' : 'text-primary'
                }`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  {feature.title}
                  {(feature as any).highlight && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full align-middle">NEW</span>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Print-Ready Collage Showcase - Big and Prominent */}
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Collage Visual */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-20 blur-2xl" />
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
                    <div className="grid grid-cols-2 gap-3">
                      {[collagePhoto, samplePhoto2, samplePhoto3, samplePhoto4].map((photo, i) => (
                        <div key={i} className="w-32 h-40 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform">
                          <img src={photo} alt={`Passport photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full mb-4">
                  BEST VALUE
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Print-Ready Collage</h3>
                <p className="text-lg text-gray-700 dark:text-slate-300 mb-6">
                  Create professional collage sheets with multiple passport photos. Perfect for printing at home or at a photo shop.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Multiple photos on one sheet',
                    'A4, 4×6", or 5×7" paper sizes',
                    'Customizable photo count',
                    'Save money vs individual prints',
                    'High-resolution 300 DPI output'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/editor/collage" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
                >
                  <Grid3x3 className="h-5 w-5" />
                  Create Collage Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">Privacy First</h3>
              <p className="text-gray-700 dark:text-slate-300">
                All image processing happens locally on your device. We never upload your photos to any server. Your privacy is guaranteed.
              </p>
            </div>
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">Simple Pricing</h3>
              <p className="text-gray-700 dark:text-slate-300">
                Single photo for just <strong>€3</strong>. Collage at <strong>€8</strong> — the more you print, the more you save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-12 text-center">How It Works</h2>

          <div className="grid md:grid-cols-6 gap-6">
            {[
              { step: '1', title: 'Upload', desc: 'Select your photo' },
              { step: '2', title: 'Crop', desc: 'Adjust the frame' },
              { step: '3', title: 'Background', desc: 'AI removes & replaces' },
              { step: '4', title: 'Adjust', desc: 'Fine-tune brightness & more' },
              { step: '5', title: 'Choose Size', desc: 'Pick your country' },
              { step: '6', title: 'Download', desc: 'Get your photo' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden md:flex justify-center mt-6">
                    <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 dark:text-slate-400 text-center mb-12">No subscriptions. Pay only for what you need.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Single Photo */}
            <div className="relative rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-8 hover:border-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Single Photo</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-slate-100">€3</span>
                <span className="text-gray-400 dark:text-slate-400 text-sm ml-2">per photo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['AI background removal', 'Any passport size standard', 'High-res 300 DPI download', 'Process on your device'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/editor/single" className="block w-full text-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg font-semibold transition">
                Get Started
              </Link>
            </div>

            {/* Collage */}
            <div className="relative rounded-2xl border-2 border-secondary p-8 shadow-lg">
              <div className="absolute -top-3 right-6">
                <span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">BEST VALUE</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Grid3x3 className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Collage</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-slate-100">€8</span>
                <span className="text-gray-400 dark:text-slate-400 text-sm ml-2">per collage</span>
              </div>
              <ul className="space-y-3 mb-4">
                {['Everything in Single Photo', 'Print-ready A4, 4×6", 5×7" or custom size', 'Multiple photos per sheet', 'Save vs individual photos'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">One sheet with multiple photos for just €8</p>
              <Link to="/editor/collage" className="block w-full text-center px-6 py-3 bg-secondary hover:bg-purple-700 text-white rounded-lg font-semibold transition">
                Create Collage
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How to Take a Passport Photo at Home */}
      <section id="home-photo" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Lightbulb className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">How to Take a Passport Photo at Home</h2>
            <p className="text-gray-600 dark:text-slate-400">
              Skip the photo studio. Follow these tips to get a compliant passport photo with just your phone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Image */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-primary rounded-2xl opacity-20 blur-2xl" />
                <img
                  src={homePhotoGuide}
                  alt="Person taking a passport photo at home with a smartphone"
                  className="relative rounded-2xl shadow-2xl max-w-full h-auto max-h-[480px] object-cover"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4 order-1 md:order-2">
              {[
                { step: '1', title: 'Find good lighting', desc: 'Stand facing a window or use soft, even lighting. Avoid harsh overhead lights that create shadows under your eyes or nose.' },
                { step: '2', title: 'Use a plain background', desc: 'Stand in front of a white or light-colored wall. Don\'t worry if it\'s not perfect — our AI will replace it.' },
                { step: '3', title: 'Position your camera at eye level', desc: 'Hold your phone at arm\'s length or use a tripod. The camera should be level with your eyes, not angled up or down.' },
                { step: '4', title: 'Keep a neutral expression', desc: 'Look directly at the camera. Keep your mouth closed, eyes open, and face relaxed. No smiling or frowning.' },
                { step: '5', title: 'Remove glasses and hats', desc: 'Most countries require no eyewear or head coverings (religious exceptions apply). Remove any accessories that obscure your face.' },
                { step: '6', title: 'Upload to WithSwag', desc: 'Our tool handles the rest — crop, resize, background removal, and compliance checks. Download your print-ready photo in seconds.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Gear — Amazon Affiliate */}
      <section id="gear" className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Printer className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Recommended Gear for Passport Photos</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Print your passport photos at home with the right equipment. These are the tools we recommend.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
              Disclosure: Links below are Amazon affiliate links. We earn a small commission at no extra cost to you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                badge: '⭐ Best Printer',
                title: 'Canon SELPHY CP1500',
                desc: 'Compact dye-sublimation printer. True photo-lab quality with protective overcoat. Prints a 4×6 in ~47 seconds.',
                price: '~$130',
                perPhoto: '~$0.25/set',
                url: 'https://www.amazon.com/Canon-SELPHY-CP1500-Compact-Printer/dp/B0BF6T86WD?tag=withswag-20',
              },
              {
                badge: '📷 Best Camera Setup',
                title: 'Smartphone Tripod + Ring Light',
                desc: 'Adjustable phone tripod with built-in ring light. Even lighting, steady shot — perfect for passport photos at home.',
                price: '~$25',
                perPhoto: 'One-time purchase',
                url: 'https://www.amazon.com/s?k=phone+tripod+ring+light+passport+photo&tag=withswag-20',
              },
              {
                badge: '🖨️ Best Photo Paper',
                title: 'Canon GP-701 Glossy 4×6',
                desc: '200 sheets of glossy photo paper. Works with any inkjet printer. Glossy finish meets passport photo requirements.',
                price: '~$18',
                perPhoto: '$0.09/sheet',
                url: 'https://www.amazon.com/dp/B00009XOZ4?tag=withswag-20',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:border-primary dark:hover:border-indigo-500 transition hover:shadow-lg">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">{item.badge}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{item.desc}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{item.price}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{item.perPhoto}</span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener sponsored"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#FF9900] hover:bg-[#e88b00] text-white rounded-lg font-semibold text-sm transition"
                >
                  View on Amazon
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Epson EcoTank ET-2850',
                desc: 'Best value inkjet. Refillable ink tanks = ultra-low running costs. Great for photos + documents.',
                price: '~$200',
                url: 'https://www.amazon.com/dp/B09BJCZ4RK?tag=withswag-20',
              },
              {
                title: 'Paper Cutter / Trimmer',
                desc: 'Clean, straight cuts for your passport photos. Much better than scissors.',
                price: '~$12',
                url: 'https://www.amazon.com/s?k=paper+cutter+trimmer+photo&tag=withswag-20',
              },
              {
                title: 'SELPHY Ink + Paper Kit',
                desc: '108-sheet pack with ink cartridge for SELPHY CP1500. Everything you need in one box.',
                price: '~$35',
                url: 'https://www.amazon.com/dp/B003Y5N0JO?tag=withswag-20',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-primary dark:hover:border-indigo-500 transition">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{item.price}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener sponsored"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FF9900] hover:bg-[#e88b00] text-white rounded-md font-medium text-xs transition"
                  >
                    Amazon
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-8">
            <a href="/guides/best-passport-photo-printers/" className="text-primary hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm underline underline-offset-2">
              See our full printer comparison guide →
            </a>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4 text-center">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-slate-400 text-center mb-10">Everything you need to know about passport photos and WithSwag.</p>

          <div className="space-y-3">
            {[
              { q: 'What size is a US passport photo?', a: 'A US passport photo must be 2×2 inches (51×51 mm). The head must be between 1 and 1⅜ inches (25–35 mm) from the bottom of the chin to the top of the head. The background must be plain white.' },
              { q: 'Can I take my own passport photo at home?', a: 'Yes. Use a smartphone or digital camera with good lighting. Stand in front of a plain white or light-colored wall. Upload your photo to WithSwag and we\'ll crop, resize, and replace the background to meet official requirements.' },
              { q: 'What background color is required for passport photos?', a: 'Most countries require a plain white or off-white background. Some countries like India accept a light-colored background. Our AI background removal lets you replace any background with the correct color instantly.' },
              { q: 'Is WithSwag free to use?', a: 'You can upload, crop, and preview your passport photo for free. High-resolution downloads with AI background removal start at €3 for a single photo or €8 for a print-ready collage sheet.' },
              { q: 'Are my photos uploaded to a server?', a: 'No. All image processing happens locally in your browser using on-device AI. Your photos are never uploaded to any server. This is a privacy-first tool — your data stays on your device.' },
              { q: 'What countries does WithSwag support?', a: 'We support passport photo standards for 50+ countries including the US, EU, UK, India, Canada, Australia, China, Malaysia, Singapore, Japan, South Korea, Brazil, and many more.' },
              { q: 'Can I print the photos at home?', a: 'Yes. Use the collage feature to create a print-ready sheet (A4, 4×6", or 5×7") with multiple photos. Print on glossy photo paper at 300 DPI for best results.' },
              { q: 'How is this different from a photo studio?', a: 'Photo studios charge $10–$20 per set. WithSwag gives you the same compliant result for €3 (single) or €8 (collage), and you can retake as many times as you want from home.' },
            ].map((item, i) => (
              <FaqItem
                key={i}
                question={item.q}
                answer={item.a}
                isOpen={openFaqIndex === i}
                onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-12 text-center">Why Choose WithSwag</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Privacy First', desc: 'Photos never leave your device. Zero server uploads. Your data is yours.' },
              { icon: Monitor, title: '100% Browser-Based', desc: 'No app to install. Works on any device with a modern browser — phone, tablet, or desktop.' },
              { icon: Globe, title: '50+ Country Standards', desc: 'US, EU, UK, India, Canada, Australia, China, and many more. Always up to date.' },
              { icon: Zap, title: 'Instant Results', desc: 'Upload, crop, and download in under 60 seconds. AI background removal in real time.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">Ready to get started?</h2>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
          Professional passport photos, starting at just €3.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/editor/single"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition"
          >
            <Camera className="h-6 w-6" />
            Start Now
          </Link>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="bg-gray-50 dark:bg-slate-800 py-20 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Privacy & Security</h2>
          <div className="space-y-4 text-gray-700 dark:text-slate-300">
            <p>
              <strong>Your photos never leave your device.</strong> All image processing is done using your browser's built-in capabilities. We don't collect, store, or transmit any of your images.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-white">WithSwag</span>
          </div>
          <p className="text-sm mb-4">
            Create professional passport photos that meet international standards.
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} WithSwag. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
