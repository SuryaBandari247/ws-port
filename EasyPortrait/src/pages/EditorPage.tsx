import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Area } from 'react-easy-crop';
import { PassportSize, AdjustmentValues } from '../types';
import { DEFAULT_DPI, PASSPORT_SIZES, PAPER_SIZES, DEFAULT_ADJUSTMENT_VALUES } from '../constants';
import { ImageUpload } from '../components/ImageUpload';
import { ImageCropper } from '../components/ImageCropper';
import { PhotoPreview } from '../components/PhotoPreview';
import { PassportSizeSelect } from '../components/PassportSizeSelect';
import { EditorControls } from '../components/EditorControls';
import { PaymentModal } from '../components/PaymentModal';
import AdjustmentPanel from '../components/AdjustmentPanel';
import AppSwitcher from '../components/AppSwitcher';
import Breadcrumbs from '../components/Breadcrumbs';
import { validateImageFile, fileToDataUrl } from '../utils/imageProcessing';
import { getTransparentImage, compositeWithBackground, clearBgRemovalCache } from '../utils/backgroundRemoval';
import { applyAdjustments, applyAdjustmentsToCanvas } from '../utils/adjustmentEngine';
import { checkPaymentStatus, getPaymentAmount, getPaymentDescription } from '../utils/payment';
import { saveAs } from 'file-saver';
import { ChevronLeft, AlertCircle, Download } from 'lucide-react';

type EditorStep = 'upload' | 'crop' | 'background' | 'adjust' | 'layout' | 'preview';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ canvas: HTMLCanvasElement; format: 'png' | 'jpg' } | null>(null);
  const [adjustmentValues, setAdjustmentValues] = useState<AdjustmentValues>({...DEFAULT_ADJUSTMENT_VALUES});
  const [canvasSupported, setCanvasSupported] = useState(true);
  const [customColor, setCustomColor] = useState('#FF6B00');
  const customColorRef = useRef<HTMLInputElement>(null);
  const customColorSidebarRef = useRef<HTMLInputElement>(null);

  const BG_COLORS = [
    { id: 'none', label: 'Original', color: 'transparent', preview: 'bg-gray-200 bg-[url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'5\' height=\'5\' fill=\'%23ccc\'/%3E%3Crect x=\'5\' y=\'5\' width=\'5\' height=\'5\' fill=\'%23ccc\'/%3E%3C/svg%3E")]' },
    { id: 'white', label: 'White', color: '#FFFFFF', preview: 'bg-white border border-gray-300' },
    { id: 'light-gray', label: 'Light Gray', color: '#E5E5E5', preview: 'bg-[#E5E5E5]' },
    { id: 'light-blue', label: 'Light Blue', color: '#D4E6F1', preview: 'bg-[#D4E6F1]' },
    { id: 'blue', label: 'Blue', color: '#2980B9', preview: 'bg-[#2980B9]' },
    { id: 'red', label: 'Red', color: '#C0392B', preview: 'bg-[#C0392B]' },
    { id: 'custom', label: 'Custom', color: customColor, preview: '' },
  ];

  // Collage-specific state
  const [numPhotos, setNumPhotos] = useState(4);

  // Check Canvas API support for adjust step (Req 8.3)
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      const ctx = testCanvas.getContext('2d');
      if (!ctx || typeof ctx.getImageData !== 'function' || typeof ctx.putImageData !== 'function') {
        setCanvasSupported(false);
      }
    } catch {
      setCanvasSupported(false);
    }
  }, []);
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
    // Check if payment has been made
    if (!checkPaymentStatus()) {
      // Store pending download and show payment modal
      setPendingDownload({ canvas, format });
      setShowPaymentModal(true);
      return;
    }
    
    // Payment verified, proceed with download
    executeDownload(canvas, format);
  };

  const executeDownload = (canvas: HTMLCanvasElement, format: 'png' | 'jpg') => {
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
    } else if (step === 'adjust') {
      setStep('background');
    } else if (step === 'layout') {
      setStep(canvasSupported ? 'adjust' : 'background');
    } else if (step === 'preview') {
      setStep(isCollage ? 'layout' : (canvasSupported ? 'adjust' : 'background'));
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

  const handleBgColorChange = async (colorId: string, colorOverride?: string) => {
    setBgColor(colorId);
    if (colorId === 'none' || !cropArea || !imageSrc) {
      setProcessedImageUrl('');
      if (cropArea && imageSrc) {
        regenerateCroppedPreview(imageSrc, cropArea);
      }
      return;
    }

    const selectedColor = colorOverride || BG_COLORS.find(b => b.id === colorId)?.color;
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

    const hasAdjustments =
      adjustmentValues.brightness !== 0 ||
      adjustmentValues.contrast !== 0 ||
      adjustmentValues.saturation !== 0 ||
      adjustmentValues.exposure !== 0 ||
      adjustmentValues.warmth !== 0 ||
      adjustmentValues.sharpness !== 0 ||
      adjustmentValues.faceLighting !== 0;

    const selectedBgColor = bgColor !== 'none' ? BG_COLORS.find(b => b.id === bgColor)?.color : undefined;
    const useTransparent = transparentBlobUrl && selectedBgColor && selectedBgColor !== 'transparent';

    const buildTile = (imgEl: HTMLImageElement, transparentImgEl?: HTMLImageElement) => {
      // Build a full-resolution tile canvas from the source image
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = photoW;
      tileCanvas.height = photoH;
      const tileCtx = tileCanvas.getContext('2d');
      if (!tileCtx) return imgEl as HTMLCanvasElement | HTMLImageElement;

      let tileSource: HTMLCanvasElement | HTMLImageElement;

      if (useTransparent && transparentImgEl && hasAdjustments) {
        // Foreground-only adjustments: draw transparent image, adjust, composite onto bg
        tileCtx.clearRect(0, 0, photoW, photoH);
        tileCtx.drawImage(transparentImgEl, 0, 0, transparentImgEl.naturalWidth, transparentImgEl.naturalHeight, 0, 0, photoW, photoH);
        const imageData = tileCtx.getImageData(0, 0, photoW, photoH);

        // Save original alpha
        const origAlpha = new Uint8ClampedArray(photoW * photoH);
        for (let i = 0; i < origAlpha.length; i++) {
          origAlpha[i] = imageData.data[i * 4 + 3];
        }

        const adjusted = applyAdjustments(imageData, adjustmentValues);

        // Restore alpha
        for (let i = 0; i < origAlpha.length; i++) {
          adjusted.data[i * 4 + 3] = origAlpha[i];
        }

        // Composite: bg color + adjusted foreground
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = photoW;
        tempCanvas.height = photoH;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.putImageData(adjusted, 0, 0);
          tileCtx.clearRect(0, 0, photoW, photoH);
          tileCtx.fillStyle = selectedBgColor!;
          tileCtx.fillRect(0, 0, photoW, photoH);
          tileCtx.drawImage(tempCanvas, 0, 0);
        }
        tileSource = tileCanvas;
      } else {
        // No foreground separation needed — apply adjustments to entire composited image
        if (processedImageUrl) {
          tileCtx.drawImage(imgEl, 0, 0, imgEl.naturalWidth, imgEl.naturalHeight, 0, 0, photoW, photoH);
        } else {
          tileCtx.drawImage(
            imgEl,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            0, 0, photoW, photoH
          );
        }

        if (hasAdjustments) {
          tileSource = applyAdjustmentsToCanvas(tileCanvas, adjustmentValues);
        } else {
          tileSource = tileCanvas;
        }
      }

      return tileSource;
    };

    const drawTiles = (tileSource: HTMLCanvasElement | HTMLImageElement) => {
      for (let i = 0; i < numPhotos; i++) {
        const row = Math.floor(i / photosPerRow);
        const col = i % photosPerRow;
        const x = col * photoW;
        const y = row * photoH;
        ctx.drawImage(tileSource, 0, 0, photoW, photoH, x, y, photoW, photoH);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);
      }
      setCollageCanvas(canvas);
      setStep('preview');
    };

    if (useTransparent) {
      // Load both the composited image and the transparent image
      const imgEl = new Image();
      imgEl.onload = () => {
        const transparentImgEl = new Image();
        transparentImgEl.onload = () => {
          const tileSource = buildTile(imgEl, transparentImgEl);
          drawTiles(tileSource);
        };
        transparentImgEl.onerror = () => {
          // Fallback: use composited image without foreground separation
          const tileSource = buildTile(imgEl);
          drawTiles(tileSource);
        };
        transparentImgEl.src = transparentBlobUrl!;
      };
      imgEl.src = processedImageUrl || imageSrc;
    } else {
      const imgEl = new Image();
      imgEl.onload = () => {
        const tileSource = buildTile(imgEl);
        drawTiles(tileSource);
      };
      imgEl.src = processedImageUrl || imageSrc;
    }
  };

  const handleCollageDownload = (format: 'png' | 'jpg') => {
    if (!collageCanvas) return;
    
    // Check if payment has been made
    if (!checkPaymentStatus()) {
      // Store pending download and show payment modal
      setPendingDownload({ canvas: collageCanvas, format });
      setShowPaymentModal(true);
      return;
    }
    
    // Payment verified, proceed with download
    executeCollageDownload(collageCanvas, format);
  };

  const executeCollageDownload = (canvas: HTMLCanvasElement, format: 'png' | 'jpg') => {
    const filename = `collage-${passportSize.id}-${numPhotos}x-${Date.now()}.${format}`;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.95 : undefined;
    canvas.toBlob(
      (blob) => { if (blob) saveAs(blob, filename); },
      mimeType,
      quality
    );
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    
    // Execute the pending download
    if (pendingDownload) {
      if (isCollage) {
        executeCollageDownload(pendingDownload.canvas, pendingDownload.format);
      } else {
        executeDownload(pendingDownload.canvas, pendingDownload.format);
      }
      setPendingDownload(null);
    }
  };

  // Progress bar steps
  const stepLabels = isCollage
    ? (canvasSupported
      ? ['Upload', 'Crop', 'Background', 'Adjust', 'Layout', 'Download']
      : ['Upload', 'Crop', 'Background', 'Layout', 'Download'])
    : (canvasSupported
      ? ['Upload', 'Crop', 'Background', 'Adjust', 'Download']
      : ['Upload', 'Crop', 'Background', 'Download']);
  const stepMap: Record<EditorStep, number> = isCollage
    ? (canvasSupported
      ? { upload: 0, crop: 1, background: 2, adjust: 3, layout: 4, preview: 5 }
      : { upload: 0, crop: 1, background: 2, adjust: -1, layout: 3, preview: 4 })
    : (canvasSupported
      ? { upload: 0, crop: 1, background: 2, adjust: 3, layout: -1, preview: 4 }
      : { upload: 0, crop: 1, background: 2, adjust: -1, layout: -1, preview: 3 });
  const currentStepIndex = stepMap[step];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <AppSwitcher />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-slate-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {isCollage ? 'Photo Collage' : 'Single Passport Photo'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span className="text-gray-400 dark:text-slate-600">→</span>}
                <span className={`px-3 py-1 rounded-full ${currentStepIndex === i ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <Breadcrumbs toolName="Portrait Photo" currentStep={stepLabels[currentStepIndex]} />

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
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Background Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BG_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            if (bg.id === 'custom') {
                              customColorSidebarRef.current?.click();
                            } else {
                              handleBgColorChange(bg.id);
                            }
                          }}
                          disabled={isRemovingBg}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                            bgColor === bg.id
                              ? 'ring-2 ring-primary ring-offset-1 bg-primary/5'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                          } ${isRemovingBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {bg.id === 'custom' ? (
                            <div className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-300 bg-gradient-to-br from-red-400 via-green-400 to-blue-400" style={bgColor === 'custom' ? { background: customColor } : undefined} />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${bg.preview} flex-shrink-0`} />
                          )}
                          <span className="text-[10px] text-gray-600 dark:text-slate-400 leading-tight text-center">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                    <input
                      ref={customColorSidebarRef}
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setCustomColor(newColor);
                        handleBgColorChange('custom', newColor);
                      }}
                      className="sr-only"
                    />
                  </div>
                  <button
                    onClick={handleBack}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg font-medium transition text-sm"
                  >
                    ← Back to Crop
                  </button>
                </>
              )}

              {/* Adjust step sidebar — sliders are in the main AdjustmentPanel component */}
              {step === 'adjust' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-slate-400">Size:</span> <span className="font-medium">{passportSize.name}</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Dimensions:</span> <span className="font-medium">{passportSize.widthMm}×{passportSize.heightMm}mm</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Background:</span> <span className="font-medium">{BG_COLORS.find(b => b.id === bgColor)?.label || 'Original'}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={handleBack}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg font-medium transition text-sm"
                  >
                    ← Back to Background
                  </button>
                </div>
              )}

              {/* Collage layout controls — layout step (controls in main area) */}
              {step === 'layout' && isCollage && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-slate-400">Size:</span> <span className="font-medium">{passportSize.name}</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Dimensions:</span> <span className="font-medium">{passportSize.widthMm}×{passportSize.heightMm}mm</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Photos:</span> <span className="font-medium">{numPhotos}</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Sheet:</span> <span className="font-medium">{getSheetDims().name}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings summary — preview step */}
              {step === 'preview' && (
                <>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-slate-400">Size:</span> <span className="font-medium">{passportSize.name}</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Dimensions:</span> <span className="font-medium">{passportSize.widthMm}×{passportSize.heightMm}mm</span></p>
                      <p><span className="text-gray-600 dark:text-slate-400">Quality:</span> <span className="font-medium">{dpi} DPI</span></p>
                      {isCollage && (
                        <p><span className="text-gray-600 dark:text-slate-400">Photos:</span> <span className="font-medium">{numPhotos}</span></p>
                      )}
                    </div>
                  </div>

                  {isCollage && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Print Sheet</label>
                    <div className="space-y-2">
                      {(['a4', '4x6', '5x7'] as const).map((key) => {
                        const size = PAPER_SIZES[key];
                        return (
                          <button
                            key={key}
                            onClick={() => handlePaperSizeChange(key)}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                              paperSize === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                            }`}
                          >
                            {size.name}
                            <span className={`block text-xs ${paperSize === key ? 'text-white/75' : 'text-gray-500 dark:text-slate-400'}`}>
                              {size.widthMm}×{size.heightMm}mm
                            </span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePaperSizeChange('custom')}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                          paperSize === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        Custom
                        <span className={`block text-xs ${paperSize === 'custom' ? 'text-white/75' : 'text-gray-500 dark:text-slate-400'}`}>
                          {customSheetW}×{customSheetH}mm
                        </span>
                      </button>
                    </div>
                    {paperSize === 'custom' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Width (mm)</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            value={customSheetW}
                            onChange={(e) => handleCustomSheetChange(parseFloat(e.target.value) || 10, customSheetH)}
                            className="w-full px-2 py-1.5 border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Height (mm)</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            value={customSheetH}
                            onChange={(e) => handleCustomSheetChange(customSheetW, parseFloat(e.target.value) || 10)}
                            className="w-full px-2 py-1.5 border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button onClick={handleBack} className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg font-medium transition">
                      {isCollage ? 'Edit Layout' : (canvasSupported ? 'Edit Adjustments' : 'Edit Background')}
                    </button>
                    <button onClick={handleNewPhoto} className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg font-medium transition">
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Upload Your Photo</h2>
                  <p className="text-gray-600 dark:text-slate-400">Select a clear, front-facing photo</p>
                </div>
                <ImageUpload onImageSelected={handleImageSelected} isLoading={isLoading} />
              </div>
            )}

            {/* CROP */}
            {step === 'crop' && imageSrc && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Crop Your Photo</h2>
                <div className="bg-white rounded-lg shadow dark:bg-slate-800 overflow-hidden" style={{ height: '600px' }}>
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Edit Background</h2>
                  <p className="text-gray-600 dark:text-slate-400">Select a background color for your passport photo</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow dark:bg-slate-800">
                  <div className="flex justify-center mb-6">
                    <div className="relative border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm" style={{ maxWidth: '320px' }}>
                      <img
                        src={croppedPreviewUrl}
                        alt="Cropped preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 text-center">Choose Background Color</h3>
                    <div className="grid grid-cols-7 gap-3 justify-center">
                      {BG_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            if (bg.id === 'custom') {
                              customColorRef.current?.click();
                            } else {
                              handleBgColorChange(bg.id);
                            }
                          }}
                          disabled={isRemovingBg}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                            bgColor === bg.id
                              ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 scale-105'
                              : 'hover:bg-gray-50 hover:scale-105 dark:hover:bg-slate-700'
                          } ${isRemovingBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {bg.id === 'custom' ? (
                            <div className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-gray-300 bg-gradient-to-br from-red-400 via-green-400 to-blue-400" style={bgColor === 'custom' ? { background: customColor } : undefined} />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${bg.preview} flex-shrink-0 shadow-sm`} />
                          )}
                          <span className="text-[10px] text-gray-600 dark:text-slate-400 leading-tight text-center font-medium">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                    <input
                      ref={customColorRef}
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setCustomColor(newColor);
                        handleBgColorChange('custom', newColor);
                      }}
                      className="sr-only"
                    />
                    {bgColor !== 'none' && (
                      <p className="text-xs text-green-600 text-center mt-3">✓ Background changed to {BG_COLORS.find(b => b.id === bgColor)?.label}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setStep(canvasSupported ? 'adjust' : (isCollage ? 'layout' : 'preview'))}
                  disabled={isRemovingBg}
                  className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {canvasSupported ? 'Next: Adjust Photo' : (isCollage ? 'Next: Configure Layout' : 'Next: Preview & Download')} →
                </button>
              </div>
            )}

            {/* ADJUST — photo adjustments */}
            {step === 'adjust' && imageSrc && cropArea && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Adjust Photo</h2>
                  <p className="text-gray-600 dark:text-slate-400">Fine-tune brightness, contrast, and more</p>
                </div>

                <AdjustmentPanel
                  imageSrc={imageSrc}
                  cropArea={cropArea}
                  processedImageUrl={processedImageUrl || ''}
                  transparentBlobUrl={transparentBlobUrl || undefined}
                  bgColor={bgColor !== 'none' ? BG_COLORS.find(b => b.id === bgColor)?.color : undefined}
                  adjustmentValues={adjustmentValues}
                  onAdjustmentChange={setAdjustmentValues}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 font-semibold rounded-lg transition"
                  >
                    ← Back to Background
                  </button>
                  <button
                    onClick={() => setStep(isCollage ? 'layout' : 'preview')}
                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
                  >
                    {isCollage ? 'Next: Configure Layout' : 'Next: Preview & Download'} →
                  </button>
                </div>
              </div>
            )}

            {/* LAYOUT — collage only */}
            {step === 'layout' && isCollage && imageSrc && cropArea && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Configure Collage Layout</h2>
                  <p className="text-gray-600 dark:text-slate-400">Choose number of photos and paper size</p>
                </div>

                {passportSize.id !== croppedWithSize.id && (
                  <div className="bg-amber-50 border border-amber-300 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg p-4 flex gap-3 items-start">
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
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{validationError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Controls */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Number of Photos</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numPhotos}
                        onChange={(e) => validateAndSetNumPhotos(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 rounded-lg text-sm"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Print Sheet</label>
                      <div className="space-y-2">
                        {(['a4', '4x6', '5x7'] as const).map((key) => {
                          const size = PAPER_SIZES[key];
                          return (
                            <button
                              key={key}
                              onClick={() => handlePaperSizeChange(key)}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                                paperSize === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                              }`}
                            >
                              {size.name}
                              <span className={`block text-xs ${paperSize === key ? 'text-white/75' : 'text-gray-500 dark:text-slate-400'}`}>
                                {size.widthMm}×{size.heightMm}mm
                              </span>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePaperSizeChange('custom')}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                            paperSize === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          Custom
                          <span className={`block text-xs ${paperSize === 'custom' ? 'text-white/75' : 'text-gray-500 dark:text-slate-400'}`}>
                            {customSheetW}×{customSheetH}mm
                          </span>
                        </button>
                      </div>
                      {paperSize === 'custom' && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Width (mm)</label>
                            <input
                              type="number"
                              min="10"
                              max="1000"
                              value={customSheetW}
                              onChange={(e) => handleCustomSheetChange(parseFloat(e.target.value) || 10, customSheetH)}
                              className="w-full px-2 py-1.5 border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Height (mm)</label>
                            <input
                              type="number"
                              min="10"
                              max="1000"
                              value={customSheetH}
                              onChange={(e) => handleCustomSheetChange(customSheetW, parseFloat(e.target.value) || 10)}
                              className="w-full px-2 py-1.5 border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 rounded-lg p-3 text-xs text-blue-900">
                      <strong>Max:</strong> {getMaxPhotos(paperSize, passportSize)} photos of{' '}
                      {passportSize.widthMm}×{passportSize.heightMm}mm fit on {getSheetDims().name}
                    </div>
                  </div>

                  {/* Right: Layout Preview */}
                  <div className="bg-white rounded-lg p-4 shadow dark:bg-slate-800">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">Layout Preview</h3>
                    {(() => {
                      const ps = getSheetDims();
                      const cols = Math.floor(ps.widthMm / passportSize.widthMm);
                      const rows = Math.floor(ps.heightMm / passportSize.heightMm);
                      const usedW = (cols * passportSize.widthMm) / ps.widthMm * 100;
                      const usedH = (rows * passportSize.heightMm) / ps.heightMm * 100;
                      return (
                        <div
                          className="bg-gray-100 border border-dashed border-gray-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg mx-auto overflow-hidden relative"
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
                                className="border border-gray-300 dark:border-slate-600 rounded overflow-hidden"
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
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-3">
                      {numPhotos} × {passportSize.widthMm}×{passportSize.heightMm}mm on {getSheetDims().name} ({getSheetDims().widthMm}×{getSheetDims().heightMm}mm)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 font-semibold rounded-lg transition"
                  >
                    {canvasSupported ? '← Back to Adjust' : '← Back to Background'}
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Preview & Download</h2>
                <div className="bg-white rounded-lg p-6 shadow dark:bg-slate-800">
                  <PhotoPreview
                    imageSrc={imageSrc}
                    cropArea={cropArea}
                    passportSize={passportSize}
                    dpi={dpi}
                    imageFile={imageFile!}
                    processedSrc={processedImageUrl || undefined}
                    transparentSrc={transparentBlobUrl || undefined}
                    bgColor={bgColor !== 'none' ? BG_COLORS.find(b => b.id === bgColor)?.color : undefined}
                    adjustmentValues={adjustmentValues}
                    onDownload={handleDownload}
                  />
                </div>
              </div>
            )}

            {/* PREVIEW — collage */}
            {step === 'preview' && isCollage && collageCanvas && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Preview & Download</h2>
                <div className="bg-white rounded-lg p-6 shadow dark:bg-slate-800 space-y-4">
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800">
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
                      className="w-full border border-gray-300 dark:border-slate-600 rounded"
                    />
                  </div>
                  
                  {/* Payment Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      <span className="font-semibold text-indigo-700">€8.00</span> for high-quality collage download
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{numPhotos} photos • One-time payment • Valid for 24 hours</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleCollageDownload('png')} className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition">
                      <Download className="h-4 w-4" />
                      Download PNG
                    </button>
                    <button onClick={() => handleCollageDownload('jpg')} className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium transition">
                      <Download className="h-4 w-4" />
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
          <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-sm mx-4 dark:bg-slate-800">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Removing Background</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">AI is detecting and removing the background…</p>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.round(bgRemovalProgress * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{Math.round(bgRemovalProgress * 100)}% complete</p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingDownload(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
        amount={getPaymentAmount(isCollage, numPhotos)}
        itemDescription={getPaymentDescription(isCollage, numPhotos, passportSize.name)}
      />
    </div>
  );
};
