/**
 * Suit overlay compositing utility.
 * Draws a suit/blazer template over the lower portion of a portrait photo,
 * keeping the face visible at the top.
 */

export interface SuitTemplate {
  id: string;
  name: string;
  gender: 'men' | 'women';
  /** SVG string that will be rendered onto the lower portion of the photo */
  svg: string;
  /** How much of the image height the suit covers (from bottom), 0-1 */
  coverRatio: number;
}

// --- SVG suit templates (inline, no external files needed) ---

const menSuitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="ms1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c3e50"/>
      <stop offset="100%" stop-color="#1a252f"/>
    </linearGradient>
  </defs>
  <!-- Shoulders & jacket -->
  <path d="M0 40 Q50 0 120 20 L150 30 Q170 10 200 8 Q230 10 250 30 L280 20 Q350 0 400 40 L400 300 L0 300 Z" fill="url(#ms1)"/>
  <!-- Lapels -->
  <path d="M150 30 L175 100 L200 70 Z" fill="#34495e"/>
  <path d="M250 30 L225 100 L200 70 Z" fill="#34495e"/>
  <!-- Shirt -->
  <path d="M175 100 L200 70 L225 100 L215 300 L185 300 Z" fill="#ecf0f1"/>
  <!-- Tie -->
  <path d="M193 80 L200 70 L207 80 L205 200 L195 200 Z" fill="#c0392b"/>
  <!-- Collar -->
  <path d="M170 35 L185 70 L200 55 Z" fill="#ecf0f1"/>
  <path d="M230 35 L215 70 L200 55 Z" fill="#ecf0f1"/>
</svg>`;

const menSuitNavySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="ms2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3a5c"/>
      <stop offset="100%" stop-color="#0f2440"/>
    </linearGradient>
  </defs>
  <path d="M0 40 Q50 0 120 20 L150 30 Q170 10 200 8 Q230 10 250 30 L280 20 Q350 0 400 40 L400 300 L0 300 Z" fill="url(#ms2)"/>
  <path d="M150 30 L175 100 L200 70 Z" fill="#1e4d7a"/>
  <path d="M250 30 L225 100 L200 70 Z" fill="#1e4d7a"/>
  <path d="M175 100 L200 70 L225 100 L215 300 L185 300 Z" fill="#f0f3f5"/>
  <path d="M193 80 L200 70 L207 80 L205 200 L195 200 Z" fill="#2c3e80"/>
  <path d="M170 35 L185 70 L200 55 Z" fill="#f0f3f5"/>
  <path d="M230 35 L215 70 L200 55 Z" fill="#f0f3f5"/>
</svg>`;

const womenBlazeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="ws1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c3e50"/>
      <stop offset="100%" stop-color="#1a252f"/>
    </linearGradient>
  </defs>
  <!-- Shoulders & blazer -->
  <path d="M0 50 Q60 5 130 25 L160 35 Q180 15 200 12 Q220 15 240 35 L270 25 Q340 5 400 50 L400 300 L0 300 Z" fill="url(#ws1)"/>
  <!-- V-neckline -->
  <path d="M160 35 L200 140 L240 35 Q220 15 200 12 Q180 15 160 35 Z" fill="#ecf0f1"/>
  <!-- Lapels -->
  <path d="M130 25 L160 35 L175 90 L145 70 Z" fill="#34495e"/>
  <path d="M270 25 L240 35 L225 90 L255 70 Z" fill="#34495e"/>
</svg>`;

const womenBlazeNavySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="ws2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3a5c"/>
      <stop offset="100%" stop-color="#0f2440"/>
    </linearGradient>
  </defs>
  <path d="M0 50 Q60 5 130 25 L160 35 Q180 15 200 12 Q220 15 240 35 L270 25 Q340 5 400 50 L400 300 L0 300 Z" fill="url(#ws2)"/>
  <path d="M160 35 L200 140 L240 35 Q220 15 200 12 Q180 15 160 35 Z" fill="#f0f3f5"/>
  <path d="M130 25 L160 35 L175 90 L145 70 Z" fill="#1e4d7a"/>
  <path d="M270 25 L240 35 L225 90 L255 70 Z" fill="#1e4d7a"/>
</svg>`;

export const SUIT_TEMPLATES: SuitTemplate[] = [
  { id: 'men-black', name: 'Black Suit', gender: 'men', svg: menSuitSvg, coverRatio: 0.45 },
  { id: 'men-navy', name: 'Navy Suit', gender: 'men', svg: menSuitNavySvg, coverRatio: 0.45 },
  { id: 'women-black', name: 'Black Blazer', gender: 'women', svg: womenBlazeSvg, coverRatio: 0.45 },
  { id: 'women-navy', name: 'Navy Blazer', gender: 'women', svg: womenBlazeNavySvg, coverRatio: 0.45 },
];


/**
 * Render an SVG string to an Image element (via blob URL).
 */
function svgToImage(svg: string, width: number, height: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load suit SVG'));
    };
    img.src = url;
  });
}

/**
 * Composite a suit overlay onto a portrait image.
 * The suit covers the bottom `coverRatio` of the image.
 * The portrait (transparent bg-removed) is drawn on top so the face shows through.
 *
 * @param transparentImageUrl - URL of the bg-removed transparent portrait
 * @param template - The suit template to apply
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @param bgColor - Background color behind everything (default white)
 * @returns data URL of the composited image
 */
export async function compositeSuitOverlay(
  transparentImageUrl: string,
  template: SuitTemplate,
  width: number,
  height: number,
  bgColor: string = '#FFFFFF'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // 1. Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw suit overlay on the bottom portion
  const suitHeight = Math.round(height * template.coverRatio);
  const suitY = height - suitHeight;
  const suitImg = await svgToImage(template.svg, width, suitHeight);
  ctx.drawImage(suitImg, 0, suitY, width, suitHeight);

  // 3. Draw the transparent portrait on top (face + body outline)
  const portraitImg = await loadImage(transparentImageUrl);
  ctx.drawImage(portraitImg, 0, 0, width, height);

  return canvas.toDataURL('image/png');
}

/**
 * Generate a small preview of the suit overlay for thumbnail display.
 */
export async function generateSuitPreview(
  template: SuitTemplate,
  size: number = 80
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, size, size);

  const suitHeight = Math.round(size * template.coverRatio);
  const suitY = size - suitHeight;
  try {
    const suitImg = await svgToImage(template.svg, size, suitHeight);
    ctx.drawImage(suitImg, 0, suitY, size, suitHeight);
  } catch {
    // fallback: just return gray
  }

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
