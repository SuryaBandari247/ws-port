import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Area } from 'react-easy-crop';
import { PassportSize } from '../types';
import { DEFAULT_DPI, PASSPORT_SIZES, PAPER_SIZES } from '../constants';
import { ImageUpload } from '../components/ImageUpload';
import { ImageCropper } from '../components/ImageCropper';
import { PhotoPreview } from '../components/PhotoPreview';
import { PassportSizeSelect } from '../components/PassportSizeSelect';
import { EditorControls } from '../components/EditorControls';
import { validateImageFile, fileToDataUrl } from '../utils/imageProcessing';
import { getTransparentImage, compositeWithBackground, clearBgRemovalCache } from '../utils/backgroundRemoval';
import { saveAs } from 'file-saver';
import { ChevronLeft, AlertCircle } from 'lucide-react';

type EditorStep = 'upload' | 'crop' | 'background' | 'layout' | 'preview';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'single' | 'collage' }>();
  const isCollage = type === 'collage';

  const [step, setStep] = useState<EditorStep>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [passportSize, setPassportSize] = useState<PassportSize>(PASSPORT_SIZES[3]);
  const [dpi, setDpi] = useState(DEFAULT_DPI);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string>('');
  const [croppedWithSize, setCroppedWithSize] = useState<PassportSize>(PASSPORT_SIZES[3]);
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState<string>('none');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState(0);
  const [transparentBlobUrl, setTransparentBlobUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');

  const BG_COLORS = [
    { id: 'none', label: 'Original', color: 'transparent', preview: 'bg-gray-200 bg-[url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'5\' height=\'5\' fill=\'%23ccc\'/%3E%3Crect x=\'5\' y=\'5\' width=\'5\' height=\'5\' fill=\'%23ccc\'/%3E%3C/svg%3E")]' },
    { id: 'white', label: 'White', color: '#FFFFFF', preview: 'bg-white border border-gray-300' },
    { id: 'light-gray', label: 'Light Gray', color: '#E5E5E5', preview: 'bg-[#E5E5E5]' },
    { id: 'light-blue', label: 'Light Blue', color: '#D4E6F1', preview: 'bg-[#D4E6F1]' },
    { id: 'blue', label: 'Blue', color: '#2980B9', preview: 'bg-[#2980B9]' },
    { id: 'red', label: 'Red', color: '#C0392B', preview: 'bg-[#C0392B]' },
  ];

  // Collage-specific state
  const [numPhotos, setNumPhotos] = useState(4);
  const [paperSize, setPaperSize] = useState<'a4' | '4x6' | '5x7' | 'custom'>('a4');
  const [customSheetW, setCustomSheetW] = useState(150);
  const [customSheetH, setCustomSheetH] = useState(100);
  const [collageCanvas, setCollageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [validationError, setValidationError] = useState('');

  const getSheetDims = (size?: 'a4' | '4x6' | '5x7' | 'custom') => {
    const s = size ?? paperSize;
    if (s === 'custom') {
      return { widthMm: customSheetW, heightMm: customSheetH, name: 'Custom' };
    }
    return PAPER_SIZES[s];
  };

  const getMaxPhotos = (paper: 'a4' | '4x6' | '5x7' | 'custom', pSize: PassportSize) => {
    const ps = getSheetDims(paper);
    const cols = Math.floor(ps.widthMm / pSize.widthMm);
    const rows = Math.floor(ps.heightMm / pSize.heightMm);
    return cols * rows;
  };

  const handleImageSelected = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    setIsLoading(true);
    try {
      setImageFile(file);
      const dataUrl = await fileToDataUrl(file);
      setImageSrc(dataUrl);
      setStep('crop');
    } catch {
      alert('Error loading image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropComplete = (area: Area) => {
    setCropArea(area);
    setCroppedWithSize(passportSize);
    // Clear bg removal cache when crop changes
    if (transparentBlobUrl) URL.revokeObjectURL(transparentBlobUrl);
    setTransparentBlobUrl('');
    setProcessedImageUrl('');
    clearBgRemovalCache();
    setBgColor('none');
    // Generate a cropped preview thumbnail
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxPreviewSize = 300;
      const scale = Math.min(maxPreviewSize / area.width, maxPreviewSize / area.height, 1);
      canvas.width = Math.round(area.width * scale);
      canvas.height = Math.round(area.height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
        setCroppedPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
      setStep('background');
    };
    img.src = imageSrc;
  };

  const handleDownload = (canvas: HTMLCanvasElement, format: 'png' | 'jpg') => {
    const filename = `passport-${passportSize.id}-${Date.now()}.${format}`;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.95 : undefined;
    canvas.toBlob(
      (blob) => { if (blob) saveAs(blob, filename); },
      mimeType,
      quality
    );
  };

  const handleBack = () => {
    if (step === 'crop') {
      setStep('upload');
      setImageSrc('');
      setImageFile(null);
    } else if (step === 'background') {
      setStep('crop');
    } else if (step === 'layout') {
      setStep('background');
    } else if (step === 'preview') {
      setStep(isCollage ? 'layout' : 'background');
    }
  };

  const handleNewPhoto = () => {
    setStep('upload');
    setImageSrc('');
    setImageFile(null);
    setCropArea(null);
    setCroppedPreviewUrl('');
    setCollageCanvas(null);
    setValidationError('');
    setBgColor('none');
    if (transparentBlobUrl) URL.revokeObjectURL(transparentBlobUrl);
    setTransparentBlobUrl('');
    setProcessedImageUrl('');
    clearBgRemovalCache();
  };

  const validateAndSetNumPhotos = (count: number) => {
    setNumPhotos(count);
    const ps = getSheetDims();
    const max = getMaxPhotos(paperSize, passportSize);
    if (count > max) {
      setValidationError(
        `Maximum ${max} photos fit on ${ps.name} (${ps.widthMm}×${ps.heightMm}mm) for photo size ${passportSize.widthMm}×${passportSize.heightMm}mm.`
      );
    } else {
      setValidationError('');
    }
  };

  const handlePaperSizeChange = (size: 'a4' | '4x6' | '5x7' | 'custom') => {
    setPaperSize(size);
    const ps = getSheetDims(size);
    const max = getMaxPhotos(size, passportSize);
    if (numPhotos > max) {
      setValidationError(
        `Maximum ${max} photos fit on ${ps.name} (${ps.widthMm}×${ps.heightMm}mm) for photo size ${passportSize.widthMm}×${passportSize.heightMm}mm.`
      );
    } else {
      setValidationError('');
    }
  };

  const handleCustomSheetChange = (w: number, h: number) => {
    setCustomSheetW(w);
    setCustomSheetH(h);
    if (paperSize === 'custom') {
      const cols = Math.floor(w / passportSize.widthMm);
      const rows = Math.floor(h / passportSize.heightMm);
      const max = cols * rows;
      if (numPhotos > max) {
        setValidationError(
          `Maximum ${max} photos fit on Custom (${w}×${h}mm) for photo size ${passportSize.widthMm}×${passportSize.heightMm}mm.`
        );
      } else {
        setValidationError('');
      }
    }
  };

  const handleBgColorChange = async (colorId: string) => {
    setBgColor(colorId);
    if (colorId === 'none' || !cropArea || !imageSrc) {
      setProcessedImageUrl('');
      if (cropArea && imageSrc) {
        regenerateCroppedPreview(imageSrc, cropArea);
      }
      return;
    }

    const selectedColor = BG_COLORS.find(b => b.id === colorId)?.color;
    if (!selectedColor) return;

    try {
      setIsRemovingBg(true);
      setBgRemovalProgress(0);
      let tUrl = transparentBlobUrl;
      if (!tUrl) {
        const transparentBlob = await getTransparentImage(
          imageSrc,
          cropArea,
          (progress) => setBgRemovalProgress(progress)
        );
        tUrl = URL.createObjectURL(transparentBlob);
        setTransparentBlobUrl(tUrl);
      }

      const result = await compositeWithBackground(
        tUrl,
        selectedColor,
        cropArea.width,
        cropArea.height
      );
      setProcessedImageUrl(result);
      setCroppedPreviewUrl(result);
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Background removal failed. Please try again.');
      setBgColor('none');
      setProcessedImageUrl('');
    } finally {
      setIsRemovingBg(false);
      setBgRemovalProgress(0);
    }
  };

  const regenerateCroppedPreview = (src: string, area: Area) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxPreviewSize = 300;
      const scale = Math.min(maxPreviewSize / area.width, maxPreviewSize / area.height, 1);
      canvas.width = Math.round(area.width * scale);
      canvas.height = Math.round(area.height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
        setCroppedPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
    };
    img.src = src;
  };

  const handleGenerateCollage = () => {
    if (!imageSrc || !cropArea) return;
    const max = getMaxPhotos(paperSize, passportSize);
    if (numPhotos > max) return;

    const ps = getSheetDims();
    const collageDpi = 300;
    const mmToPx = collageDpi / 25.4;
    const paperW = Math.round(ps.widthMm * mmToPx);
    const paperH = Math.round(ps.heightMm * mmToPx);
    const photoW = Math.round(passportSize.widthMm * mmToPx);
    const photoH = Math.round(passportSize.heightMm * mmToPx);
    const photosPerRow = Math.floor(paperW / photoW);

    const canvas = document.createElement('canvas');
    canvas.width = paperW;
    canvas.height = paperH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, paperW, paperH);

    const imgEl = new Image();
    imgEl.onload = () => {
      for (let i = 0; i < numPhotos; i++) {
        const row = Math.floor(i / photosPerRow);
        const col = i % photosPerRow;
        const x = col * photoW;
        const y = row * photoH;
        if (processedImageUrl) {
          // Draw processed image (already cropped + bg replaced)
          ctx.drawImage(imgEl, 0, 0, imgEl.naturalWidth, imgEl.naturalHeight, x, y, photoW, photoH);
        } else {
          ctx.drawImage(
            imgEl,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            x, y, photoW, photoH
          );
        }
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);
      }
      setCollageCanvas(canvas);
      setStep('preview');
    };
    imgEl.src = processedImageUrl || imageSrc;
  };

  const handleCollageDownload = (format: 'png' | 'jpg') => {
    if (!collageCanvas) return;
    const filename = `collage-${passportSize.id}-${numPhotos}x-${Date.now()}.${format}`;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.95 : undefined;
    collageCanvas.toBlob(
      (blob) => { if (blob) saveAs(blob, filename); },
      mimeType,
      quality
    );
  };

  // Progress bar steps
  const stepLabels = isCollage
    ? ['Upload', 'Crop', 'Background', 'Layout', 'Download']
    : ['Upload', 'Crop', 'Background', 'Download'];
  const stepMap = isCollage
    ? { upload: 0, crop: 1, background: 2, layout: 3, preview: 4 }
    : { upload: 0, crop: 1, background: 2, layout: -1, preview: 3 };
  const currentStepIndex = stepMap[step];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Home Button */}
      <a href="/" className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-700 hover:text-indigo-600 font-medium">
        <span className="text-xl">🏠</span>
        <span className="hidden sm:inline">Home</span>
      </a>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isCollage ? 'Photo Collage' : 'Single Passport Photo'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span className="text-gray-400">→</span>}
                <span className={`px-3 py-1 rounded-full ${currentStepIndex === i ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  {label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content — identical sidebar+main layout for both single & collage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">

              {/* Passport size list — upload & crop steps only */}
              {(step === 'upload' || step === 'crop') && (
                <PassportSizeSelect selected={passportSize} onSelect={setPassportSize} />
              )}

              {/* DPI controls — crop step */}
              {step === 'crop' && (
                <EditorControls
                  passportSize={passportSize}
                  dpi={dpi}
                  onPassportSizeChange={setPassportSize}
                  onDpiChange={setDpi}
                  onBack={handleBack}
                />
              )}

              {/* Background step sidebar */}
              {step === 'background' && (
                <>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Background Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BG_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleBgColorChange(bg.id)}
                          disabled={isRemovingBg}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                            bgColor === bg.id
                              ? 'ring-2 ring-primary ring-offset-1 bg-primary/5'
                              : 'hover:bg-gray-50'
                          } ${isRemovingBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${bg.preview} flex-shrink-0`} />
                          <span className="text-[10px] text-gray-600 leading-tight text-center">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleBack}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition text-sm"
                  >
                    ← Back to Crop
                  </button>
                </>
              )}

              {/* Collage layout controls — layout step (controls in main area) */}
              {step === 'layout' && isCollage && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Size:</span> <span className="font-medium">{passportSize.name}</span></p>
                      <p><span className="text-gray-600">Dimensions:</span> <span className="font-medium">{passportSize.widthMm}×{passportSize.heightMm}mm</span></p>
                      <p><span className="text-gray-600">Photos:</span> <span className="font-medium">{numPhotos}</span></p>
                      <p><span className="text-gray-600">Sheet:</span> <span className="font-medium">{getSheetDims().name}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings summary — preview step */}
              {step === 'preview' && (
                <>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Size:</span> <span className="font-medium">{passportSize.name}</span></p>
                      <p><span className="text-gray-600">Dimensions:</span> <span className="font-medium">{passportSize.widthMm}×{passportSize.heightMm}mm</span></p>
                      <p><span className="text-gray-600">Quality:</span> <span className="font-medium">{dpi} DPI</span></p>
                      {isCollage && (
                        <p><span className="text-gray-600">Photos:</span> <span className="font-medium">{numPhotos}</span></p>
                      )}
                    </div>
                  </div>

                  {isCollage && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Print Sheet</label>
                    <div className="space-y-2">
                      {(['a4', '4x6', '5x7'] as const).map((key) => {
                        const size = PAPER_SIZES[key];
                        return (
                          <button
                            key={key}
                            onClick={() => handlePaperSizeChange(key)}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                              paperSize === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size.name}
                            <span className={`block text-xs ${paperSize === key ? 'text-white/75' : 'text-gray-500'}`}>
                              {size.widthMm}×{size.heightMm}mm
                            </span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePaperSizeChange('custom')}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                          paperSize === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Custom
                        <span className={`block text-xs ${paperSize === 'custom' ? 'text-white/75' : 'text-gray-500'}`}>
                          {customSheetW}×{customSheetH}mm
                        </span>
                      </button>
                    </div>
                    {paperSize === 'custom' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Width (mm)</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            value={customSheetW}
                            onChange={(e) => handleCustomSheetChange(parseFloat(e.target.value) || 10, customSheetH)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Height (mm)</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            value={customSheetH}
                            onChange={(e) => handleCustomSheetChange(customSheetW, parseFloat(e.target.value) || 10)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button onClick={handleBack} className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                      {isCollage ? 'Edit Layout' : 'Edit Background'}
                    </button>
                    <button onClick={handleNewPhoto} className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                      New Photo
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ── Right Content — Main Area ── */}
          <div className="lg:col-span-3 order-1 lg:order-2">

            {/* UPLOAD */}
            {step === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
                  <p className="text-gray-600">Select a clear, front-facing photo</p>
                </div>
                <ImageUpload onImageSelected={handleImageSelected} isLoading={isLoading} />
              </div>
            )}

            {/* CROP */}
            {step === 'crop' && imageSrc && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Crop Your Photo</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
                  <ImageCropper
                    imageSrc={imageSrc}
                    passportSize={passportSize}
                    dpi={dpi}
                    onCropComplete={handleCropComplete}
                  />
                </div>
              </div>
            )}

            {/* BACKGROUND — edit background color */}
            {step === 'background' && imageSrc && cropArea && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Background</h2>
                  <p className="text-gray-600">Select a background color for your passport photo</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex justify-center mb-6">
                    <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ maxWidth: '320px' }}>
                      <img
                        src={croppedPreviewUrl}
                        alt="Cropped preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Background Color</h3>
                    <div className="grid grid-cols-6 gap-3 justify-center">
                      {BG_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleBgColorChange(bg.id)}
                          disabled={isRemovingBg}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                            bgColor === bg.id
                              ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 scale-105'
                              : 'hover:bg-gray-50 hover:scale-105'
                          } ${isRemovingBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full ${bg.preview} flex-shrink-0 shadow-sm`} />
                          <span className="text-[10px] text-gray-600 leading-tight text-center font-medium">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                    {bgColor !== 'none' && (
                      <p className="text-xs text-green-600 text-center mt-3">✓ Background changed to {BG_COLORS.find(b => b.id === bgColor)?.label}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setStep(isCollage ? 'layout' : 'preview')}
                  disabled={isRemovingBg}
                  className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {isCollage ? 'Next: Configure Layout' : 'Next: Preview & Download'} →
                </button>
              </div>
            )}

            {/* LAYOUT — collage only */}
            {step === 'layout' && isCollage && imageSrc && cropArea && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Collage Layout</h2>
                  <p className="text-gray-600">Choose number of photos and paper size</p>
                </div>

                {passportSize.id !== croppedWithSize.id && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Passport size changed</p>
                      <p className="text-xs text-amber-700 mt-1">
                        You cropped with <strong>{croppedWithSize.name}</strong> ({croppedWithSize.widthMm}×{croppedWithSize.heightMm}mm) but now selected <strong>{passportSize.name}</strong> ({passportSize.widthMm}×{passportSize.heightMm}mm). The aspect ratio may differ — consider going back to re-crop.
                      </p>
                      <button
                        onClick={() => setStep('crop')}
                        className="mt-2 text-xs font-semibold text-amber-800 underline hover:text-amber-900"
                      >
                        Go back to Crop →
                      </button>
                    </div>
                  </div>
                )}

                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{validationError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Controls */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Number of Photos</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numPhotos}
                        onChange={(e) => validateAndSetNumPhotos(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Print Sheet</label>
                      <div className="space-y-2">
                        {(['a4', '4x6', '5x7'] as const).map((key) => {
                          const size = PAPER_SIZES[key];
                          return (
                            <button
                              key={key}
                              onClick={() => handlePaperSizeChange(key)}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                                paperSize === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {size.name}
                              <span className={`block text-xs ${paperSize === key ? 'text-white/75' : 'text-gray-500'}`}>
                                {size.widthMm}×{size.heightMm}mm
                              </span>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePaperSizeChange('custom')}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                            paperSize === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Custom
                          <span className={`block text-xs ${paperSize === 'custom' ? 'text-white/75' : 'text-gray-500'}`}>
                            {customSheetW}×{customSheetH}mm
                          </span>
                        </button>
                      </div>
                      {paperSize === 'custom' && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Width (mm)</label>
                            <input
                              type="number"
                              min="10"
                              max="1000"
                              value={customSheetW}
                              onChange={(e) => handleCustomSheetChange(parseFloat(e.target.value) || 10, customSheetH)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Height (mm)</label>
                            <input
                              type="number"
                              min="10"
                              max="1000"
                              value={customSheetH}
                              onChange={(e) => handleCustomSheetChange(customSheetW, parseFloat(e.target.value) || 10)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                      <strong>Max:</strong> {getMaxPhotos(paperSize, passportSize)} photos of{' '}
                      {passportSize.widthMm}×{passportSize.heightMm}mm fit on {getSheetDims().name}
                    </div>
                  </div>

                  {/* Right: Layout Preview */}
                  <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Layout Preview</h3>
                    {(() => {
                      const ps = getSheetDims();
                      const cols = Math.floor(ps.widthMm / passportSize.widthMm);
                      const rows = Math.floor(ps.heightMm / passportSize.heightMm);
                      const usedW = (cols * passportSize.widthMm) / ps.widthMm * 100;
                      const usedH = (rows * passportSize.heightMm) / ps.heightMm * 100;
                      return (
                        <div
                          className="bg-gray-100 border border-dashed border-gray-300 rounded-lg mx-auto overflow-hidden relative"
                          style={{
                            aspectRatio: `${ps.widthMm} / ${ps.heightMm}`,
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: `${usedW}%`,
                              height: `${usedH}%`,
                              display: 'grid',
                              gridTemplateColumns: `repeat(${cols}, 1fr)`,
                              gridTemplateRows: `repeat(${rows}, 1fr)`,
                              gap: '2px',
                              padding: '2px',
                            }}
                          >
                            {Array.from({ length: Math.min(numPhotos, cols * rows) }).map((_, i) => (
                              <div
                                key={i}
                                className="border border-gray-300 rounded overflow-hidden"
                              >
                                {croppedPreviewUrl ? (
                                  <img
                                    src={croppedPreviewUrl}
                                    alt={`Photo ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                    {i + 1}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-xs text-gray-500 text-center mt-3">
                      {numPhotos} × {passportSize.widthMm}×{passportSize.heightMm}mm on {getSheetDims().name} ({getSheetDims().widthMm}×{getSheetDims().heightMm}mm)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition"
                  >
                    ← Back to Background
                  </button>
                  <button
                    onClick={handleGenerateCollage}
                    disabled={!!validationError || numPhotos < 1}
                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    Generate Collage →
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW — single photo */}
            {step === 'preview' && !isCollage && imageSrc && cropArea && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Preview & Download</h2>
                <div className="bg-white rounded-lg p-6 shadow">
                  <PhotoPreview
                    imageSrc={imageSrc}
                    cropArea={cropArea}
                    passportSize={passportSize}
                    dpi={dpi}
                    imageFile={imageFile!}
                    processedSrc={processedImageUrl || undefined}
                    onDownload={handleDownload}
                  />
                </div>
              </div>
            )}

            {/* PREVIEW — collage */}
            {step === 'preview' && isCollage && collageCanvas && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Preview & Download</h2>
                <div className="bg-white rounded-lg p-6 shadow space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={(el) => {
                        if (el && collageCanvas) {
                          const ctx = el.getContext('2d');
                          if (ctx) {
                            el.width = Math.min(collageCanvas.width, 800);
                            el.height = (el.width / collageCanvas.width) * collageCanvas.height;
                            ctx.drawImage(collageCanvas, 0, 0, el.width, el.height);
                          }
                        }
                      }}
                      className="w-full border border-gray-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleCollageDownload('png')} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition">
                      Download PNG
                    </button>
                    <button onClick={() => handleCollageDownload('jpg')} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium transition">
                      Download JPG
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Background removal loading overlay */}
      {isRemovingBg && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-sm mx-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Removing Background</h3>
            <p className="text-sm text-gray-600 mb-3">AI is detecting and removing the background…</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.round(bgRemovalProgress * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(bgRemovalProgress * 100)}% complete</p>
          </div>
        </div>
      )}
    </div>
  );
};
