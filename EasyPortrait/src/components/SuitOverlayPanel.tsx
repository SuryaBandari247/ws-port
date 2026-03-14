import React, { useState, useEffect, useRef } from 'react';
import { Shirt, X } from 'lucide-react';
import {
  SUIT_TEMPLATES,
  SuitTemplate,
  compositeSuitOverlay,
  generateSuitPreview,
} from '../utils/suitOverlay';

interface SuitOverlayPanelProps {
  transparentBlobUrl: string;
  bgColor: string;
  width: number;
  height: number;
  selectedSuitId: string | null;
  onSuitChange: (templateId: string | null, compositedUrl: string | null) => void;
}

type GenderFilter = 'all' | 'men' | 'women';

const SuitOverlayPanel: React.FC<SuitOverlayPanelProps> = ({
  transparentBlobUrl,
  bgColor,
  width,
  height,
  selectedSuitId,
  onSuitChange,
}) => {
  const [gender, setGender] = useState<GenderFilter>('all');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [compositePreview, setCompositePreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate suit thumbnail previews on mount
  useEffect(() => {
    const loadPreviews = async () => {
      const result: Record<string, string> = {};
      for (const t of SUIT_TEMPLATES) {
        result[t.id] = await generateSuitPreview(t, 80);
      }
      setPreviews(result);
    };
    loadPreviews();
  }, []);

  // Update composite preview when suit selection changes
  useEffect(() => {
    if (!selectedSuitId || !transparentBlobUrl) {
      setCompositePreview(null);
      return;
    }
    const template = SUIT_TEMPLATES.find((t) => t.id === selectedSuitId);
    if (!template) return;

    let cancelled = false;
    const previewW = Math.min(width, 400);
    const previewH = Math.round(previewW * (height / width));

    compositeSuitOverlay(transparentBlobUrl, template, previewW, previewH, bgColor)
      .then((url) => {
        if (!cancelled) setCompositePreview(url);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [selectedSuitId, transparentBlobUrl, bgColor, width, height]);

  const handleSelect = async (template: SuitTemplate) => {
    if (selectedSuitId === template.id) {
      // Deselect
      onSuitChange(null, null);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await compositeSuitOverlay(
        transparentBlobUrl,
        template,
        width,
        height,
        bgColor
      );
      onSuitChange(template.id, result);
    } catch (err) {
      console.error('Suit overlay failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    onSuitChange(null, null);
  };

  const filtered = SUIT_TEMPLATES.filter(
    (t) => gender === 'all' || t.gender === gender
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Preview area */}
      <div className="flex-1 order-1 md:order-2 flex items-center justify-center">
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 w-full flex items-center justify-center min-h-[300px]">
          {compositePreview ? (
            <img
              src={compositePreview}
              alt="Suit overlay preview"
              className="max-w-full max-h-[500px] rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400 dark:text-slate-500">
              <Shirt className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a suit to preview</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center rounded-lg">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar controls */}
      <div className="w-full md:w-72 flex-shrink-0 order-2 md:order-1">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Shirt className="h-4 w-4 text-indigo-500" />
            Formal Outfit
          </h3>

          {/* Gender filter */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {(['all', 'men', 'women'] as GenderFilter[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  gender === g
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                {g === 'all' ? 'All' : g === 'men' ? "Men's" : "Women's"}
              </button>
            ))}
          </div>

          {/* Suit grid */}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template)}
                disabled={isProcessing}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
                  selectedSuitId === template.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {previews[template.id] ? (
                  <img
                    src={previews[template.id]}
                    alt={template.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-100 dark:bg-slate-700" />
                )}
                <span className="text-[10px] font-medium text-gray-700 dark:text-slate-300 text-center leading-tight">
                  {template.name}
                </span>
                {selectedSuitId === template.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px]">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Remove button */}
          {selectedSuitId && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 border-2 border-red-300 rounded-lg font-semibold text-sm transition hover:bg-red-50 dark:bg-slate-800 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
              Remove Outfit
            </button>
          )}

          <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
            Optional: adds a formal suit overlay to your photo
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuitOverlayPanel;
