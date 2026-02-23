import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Grid3x3, ArrowRight, Check, Wand2, Crop, FileText, Sun, Contrast as ContrastIcon, Palette } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import AppSwitcher from '../components/AppSwitcher';
import Breadcrumbs from '../components/Breadcrumbs';
import samplePhoto1 from '../resources/Gemini_Generated_Image_29o95h29o95h29o9_1.jpeg';
import samplePhoto2 from '../resources/Gemini_Generated_Image_2ff4mq2ff4mq2ff4.jpeg';
import samplePhoto3 from '../resources/Gemini_Generated_Image_7aflzh7aflzh7afl.jpeg';
import samplePhoto4 from '../resources/Gemini_Generated_Image_n0jv12n0jv12n0jv.jpeg';
import collagePhoto from '../resources/abced.jpeg';

const BG_DEMO_COLORS = [
  { color: '#FFFFFF', label: 'White' },
  { color: '#BFDBFE', label: 'Light Blue' },
  { color: '#F87171', label: 'Red' },
  { color: '#D1D5DB', label: 'Gray' },
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

  const CROP_SIZES = [
    { name: 'US / India', dims: '2×2″', w: 1, h: 1, flag: '🇺🇸' },
    { name: 'EU / UK', dims: '35×45mm', w: 35, h: 45, flag: '🇪🇺' },
    { name: 'Canada', dims: '50×70mm', w: 50, h: 70, flag: '🇨🇦' },
    { name: 'China', dims: '33×48mm', w: 33, h: 48, flag: '🇨🇳' },
    { name: 'Malaysia', dims: '35×50mm', w: 35, h: 50, flag: '🇲🇾' },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppSwitcher />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">EasyPortrait</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy
            </a>
          </div>
        </div>
      </nav>

      <Breadcrumbs toolName="Portrait Photo" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 items-center">

          {/* Left Column: Cards 1 & 2 */}
          <div className="hidden md:flex flex-col gap-5 order-1">
            {/* Card 1: AI Background Removal */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-15 blur-lg" />
              <div className="relative bg-white rounded-xl shadow-lg px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-[52px] h-[68px] rounded-md overflow-hidden shadow-sm border border-gray-200">
                      <img src={samplePhoto1} alt="Original" className="w-full h-full object-cover" />
                    </div>
                    <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                    <div
                      className="w-[52px] h-[68px] rounded-md shadow-sm border border-primary/30 overflow-hidden relative transition-colors duration-700 ease-in-out"
                      style={{ backgroundColor: BG_DEMO_COLORS[activeBgIndex].color }}
                    >
                      {bgRemovalLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                    <div className="flex flex-wrap gap-1.5">
                      {BG_DEMO_COLORS.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveBgIndex(i)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            i === activeBgIndex
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${c.color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                            style={{ backgroundColor: c.color }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Wand2 className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">AI Background Removal</span>
                  <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-full">NEW</span>
                </div>
              </div>
            </div>

            {/* Card 2: Smart Crop */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-xl opacity-15 blur-lg" />
              <div className="relative bg-white rounded-xl shadow-lg px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 bg-gray-100 rounded-lg overflow-hidden shadow-inner flex-shrink-0">
                    <img src={samplePhoto2} alt="Full photo" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative rounded overflow-hidden shadow-md border-2 border-primary transition-all duration-700 ease-in-out"
                        style={{
                          width: `${Math.min(100, 100 * (CROP_SIZES[activeCropIndex].w / Math.max(CROP_SIZES[activeCropIndex].w, CROP_SIZES[activeCropIndex].h)))}px`,
                          height: `${Math.min(100, 100 * (CROP_SIZES[activeCropIndex].h / Math.max(CROP_SIZES[activeCropIndex].w, CROP_SIZES[activeCropIndex].h)))}px`,
                        }}
                      >
                        <img src={samplePhoto2} alt="Cropped" className="w-full h-full object-cover" />
                        {['-top-0.5 -left-0.5', '-top-0.5 -right-0.5', '-bottom-0.5 -left-0.5', '-bottom-0.5 -right-0.5'].map((pos, i) => (
                          <div key={i} className={`absolute ${pos} w-2 h-2 bg-primary rounded-sm`} />
                        ))}
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-center py-0.5 text-[10px] font-bold">
                          {CROP_SIZES[activeCropIndex].flag} {CROP_SIZES[activeCropIndex].dims}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {CROP_SIZES.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCropIndex(i)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            i === activeCropIndex
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span>{size.flag}</span>
                          <span>{size.dims}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Crop className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-semibold text-secondary">Smart Crop — Any Country, Any Size</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Text Block */}
          <div className="order-first md:order-2 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Create Professional Passport Photos
            </h1>
            <p className="text-xl text-gray-600 mb-8">
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
          <div className="hidden md:flex flex-col gap-5 order-3">
            {/* Card 3: Sheet Sizes */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-primary rounded-xl opacity-15 blur-lg" />
              <div className="relative bg-white rounded-xl shadow-lg px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 bg-gray-50 rounded-lg overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                    {(() => {
                      const sheet = SHEET_SIZES[activeSheetIndex];
                      const aspect = sheet.w / sheet.h;
                      const maxH = 100;
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
                          <div className="absolute -bottom-0.5 inset-x-0 bg-black/50 text-white text-center py-0.5 text-[9px] font-bold rounded-b-sm">
                            {sheet.label}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {SHEET_SIZES.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSheetIndex(i)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            i === activeSheetIndex
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-[10px]">📄</span>
                          <span>{size.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">{SHEET_SIZES[activeSheetIndex].cols * SHEET_SIZES[activeSheetIndex].rows} photos per sheet</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <FileText className="h-3 w-3 text-green-600" />
                  <span className="text-[10px] font-semibold text-green-600">Custom Sheet Size — Print Ready</span>
                </div>
              </div>
            </div>

            {/* Card 4: Photo Adjustments */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl opacity-15 blur-lg" />
              <div className="relative bg-white rounded-xl shadow-lg px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden shadow-inner flex-shrink-0">
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
                    <div className="flex flex-wrap gap-1.5">
                      {ADJUST_DEMO_ITEMS.map((item, i) => (
                        <button
                          key={i}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            i === activeAdjustIndex ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <item.icon className="h-3 w-3" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-500">Photo Adjustments — Fine-Tune Your Look</span>
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-full">NEW</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
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
                  ? 'border-primary bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20'
                  : 'border-gray-200 hover:border-primary'
              }`}>
                <feature.icon className={`h-10 w-10 mb-4 ${
                  (feature as any).highlight ? 'text-primary' : 'text-primary'
                }`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                  {(feature as any).highlight && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full align-middle">NEW</span>
                  )}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Print-Ready Collage Showcase - Big and Prominent */}
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12 border-2 border-purple-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Collage Visual */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-2xl opacity-20 blur-2xl" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="grid grid-cols-2 gap-3">
                      {[collagePhoto, samplePhoto2, samplePhoto3, samplePhoto4].map((photo, i) => (
                        <div key={i} className="w-32 h-40 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:scale-105 transition-transform">
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
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Print-Ready Collage</h3>
                <p className="text-lg text-gray-700 mb-6">
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
                    <li key={i} className="flex items-center gap-3 text-gray-700">
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
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-700">
                All image processing happens locally on your device. We never upload your photos to any server. Your privacy is guaranteed.
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Simple Pricing</h3>
              <p className="text-gray-700">
                Single photo for just <strong>$5</strong>. Collage at <strong>$8</strong> — the more you print, the more you save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

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
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
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
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-center mb-12">No subscriptions. Pay only for what you need.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Single Photo */}
            <div className="relative rounded-2xl border-2 border-gray-200 p-8 hover:border-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Single Photo</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$5</span>
                <span className="text-gray-400 text-sm ml-2">per photo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['AI background removal', 'Any passport size standard', 'High-res 300 DPI download', 'Process on your device'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
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
                <h3 className="text-xl font-bold text-gray-900">Collage</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$8</span>
                <span className="text-gray-400 text-sm ml-2">per collage</span>
              </div>
              <ul className="space-y-3 mb-4">
                {['Everything in Single Photo', 'Print-ready A4, 4×6", 5×7" sheets', 'Multiple photos per sheet', 'Save vs individual photos'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mb-4">One sheet with multiple photos for just $8</p>
              <Link to="/editor/collage" className="block w-full text-center px-6 py-3 bg-secondary hover:bg-purple-700 text-white rounded-lg font-semibold transition">
                Create Collage
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Professional passport photos, starting at just $5.
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
      <section id="privacy" className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Security</h2>
          <div className="space-y-4 text-gray-700">
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
            <span className="text-lg font-bold text-white">EasyPortrait</span>
          </div>
          <p className="text-sm mb-4">
            Create professional passport photos that meet international standards.
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} EasyPortrait. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
