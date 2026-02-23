# Implementation Plan: Photo Adjustments

## Overview

Add a photo adjustment step to the EasyPortrait editor workflow with seven sliders (Brightness, Contrast, Saturation, Exposure, Warmth, Sharpness, Face Lighting), a pure pixel-manipulation engine, real-time preview, full-resolution download integration, a landing page showcase card, and cross-app navigation components for both EasyPortrait and SRT Editor.

## Tasks

- [x] 1. Define data models, types, and constants
  - [x] 1.1 Add `AdjustmentValues` and `AdjustmentSliderConfig` interfaces to `EasyPortrait/src/types/index.ts`
    - `AdjustmentValues`: brightness, contrast, saturation, exposure, warmth (all -100 to +100, default 0), sharpness and faceLighting (0 to +100, default 0)
    - `AdjustmentSliderConfig`: key, label, min, max, step, defaultValue, icon (LucideIcon)
    - _Requirements: 2.1, 2.5, 5.1_

  - [x] 1.2 Add `DEFAULT_ADJUSTMENT_VALUES` and `ADJUSTMENT_SLIDERS` constants to `EasyPortrait/src/constants/index.ts`
    - Import Lucide icons: Sun, Contrast, Palette, Aperture, Thermometer, Focus, Lightbulb
    - Define `DEFAULT_ADJUSTMENT_VALUES` with all zeros
    - Define `ADJUSTMENT_SLIDERS` array with 7 slider configs including icon, label, min, max, step, defaultValue
    - Define `ADJUSTMENT_DEBOUNCE_MS = 150`
    - _Requirements: 2.1, 2.3, 2.5_

  - [x] 1.3 Create `WithSwagApp` interface and `WITHSWAG_APPS` registry in `EasyPortrait/src/constants/apps.ts`
    - `WithSwagApp` interface: name, path, icon, description (all strings)
    - `WITHSWAG_APPS` array with Portrait Photo (`/portrait/`, Camera) and SRT Editor (`/srt-editor/`, FileText)
    - _Requirements: 10.1_

- [x] 2. Implement the adjustment engine utility
  - [x] 2.1 Create `EasyPortrait/src/utils/adjustmentEngine.ts` with `applyAdjustments` function
    - Pure function: accepts `ImageData` and `AdjustmentValues`, returns new `ImageData`
    - Pipeline order: Brightness → Contrast → Exposure → Saturation → Warmth → Face Lighting → Sharpness → Clamp [0, 255]
    - Brightness: additive RGB shift `pixel[c] + (brightness / 100) * 255`
    - Contrast: `factor = (259 * (contrast + 255)) / (255 * (259 - contrast))`, scale from midpoint 128
    - Exposure: `pixel[c] * Math.pow(2, exposure / 100)`
    - Saturation: blend toward luminance `lum + (pixel[c] - lum) * (1 + saturation / 100)`
    - Warmth: `R += warmth * 0.5`, `B -= warmth * 0.5`
    - Face Lighting: radial gradient mask centered at (width/2, height*0.4), brighten center
    - Sharpness: 3×3 unsharp mask kernel `[0,-1,0],[-1,5,-1],[0,-1,0]`, blended by sharpness/100
    - Clamp all channels to [0, 255]
    - Identity property: default values produce identical output
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 2.2 Add `applyAdjustmentsToCanvas` function to `adjustmentEngine.ts`
    - Accepts `HTMLCanvasElement` and `AdjustmentValues`, returns new `HTMLCanvasElement`
    - Gets 2D context, extracts ImageData, calls `applyAdjustments`, puts result on new canvas
    - Error handling: if `getContext('2d')` returns null, return source canvas unmodified and `console.error`
    - _Requirements: 5.1, 8.1_

  - [ ]* 2.3 Write property tests for adjustment engine — identity (Property 1)
    - **Property 1: Identity — default adjustments produce identical output**
    - Create `EasyPortrait/src/__tests__/adjustmentEngine.test.ts`
    - Set up fast-check with custom `arbImageData` arbitrary generating random ImageData
    - Verify `applyAdjustments(imageData, DEFAULT_ADJUSTMENT_VALUES)` produces identical pixel data
    - Minimum 100 iterations
    - **Validates: Requirements 5.10**

  - [ ]* 2.4 Write property tests for adjustment engine — clamping (Property 2)
    - **Property 2: Output pixel values are always clamped to [0, 255]**
    - Custom `arbAdjustmentValues` arbitrary generating random values within defined ranges
    - Verify every channel in output is integer in [0, 255] for any inputs
    - **Validates: Requirements 5.9**

  - [ ]* 2.5 Write property tests for adjustment engine — brightness monotonicity (Property 3)
    - **Property 3: Positive brightness increases pixel values**
    - Generate random ImageData and positive brightness (1–100), all other adjustments default
    - Verify every output channel ≥ corresponding input channel
    - **Validates: Requirements 5.2**

  - [ ]* 2.6 Write property tests for adjustment engine — contrast expansion (Property 4)
    - **Property 4: Positive contrast increases distance from midpoint**
    - Generate random ImageData and positive contrast (1–100), all other adjustments default
    - Verify `|output[c] - 128| >= |input[c] - 128|` except where clamping applies
    - **Validates: Requirements 5.3**

  - [ ]* 2.7 Write property tests for adjustment engine — saturation to grayscale (Property 5)
    - **Property 5: Full negative saturation produces grayscale**
    - Generate random ImageData, set saturation to -100, all others default
    - Verify R = G = B for every pixel in output
    - **Validates: Requirements 5.4**

  - [ ]* 2.8 Write property tests for adjustment engine — exposure monotonicity (Property 6)
    - **Property 6: Positive exposure increases pixel values**
    - Generate random ImageData and positive exposure (1–100), all others default
    - Verify every output channel ≥ corresponding input channel
    - **Validates: Requirements 5.5**

  - [ ]* 2.9 Write property tests for adjustment engine — warmth channel shift (Property 7)
    - **Property 7: Positive warmth shifts red up and blue down**
    - Generate random ImageData and positive warmth (1–100), all others default
    - Verify output red ≥ input red and output blue ≤ input blue per pixel
    - **Validates: Requirements 5.6**

  - [ ]* 2.10 Write property tests for adjustment engine — face lighting center bias (Property 8)
    - **Property 8: Face lighting brightens center more than edges**
    - Generate image ≥ 3×3, set faceLighting > 0, all others default
    - Verify center pixel brightness increase ≥ corner pixel brightness increase
    - **Validates: Requirements 5.8**

  - [ ]* 2.11 Write unit tests for adjustment engine edge cases
    - Create `EasyPortrait/src/__tests__/adjustmentEngine.unit.test.ts`
    - Test all-black image (0,0,0), all-white image (255,255,255), single-pixel image
    - Test `getContext` returns null → source canvas returned (Req 8.1)
    - Test empty/malformed pixel data → source ImageData returned
    - _Requirements: 5.9, 8.1_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the AdjustmentPanel component
  - [x] 4.1 Create `EasyPortrait/src/components/AdjustmentPanel.tsx`
    - Props: `imageSrc`, `cropArea`, `processedImageUrl`, `adjustmentValues`, `onAdjustmentChange`
    - Render sidebar with 7 labeled `<input type="range">` sliders from `ADJUSTMENT_SLIDERS` config
    - Each slider prefixed with its Lucide icon, shows numeric value label
    - Each slider has `<label>` with `for`/`id` pairing for accessibility
    - Render `<canvas>` preview in main area showing adjusted image
    - Debounce slider changes (150ms) before calling `applyAdjustments` on preview canvas
    - Previous frame stays visible during computation (no flicker)
    - "Reset All" button resets values to `DEFAULT_ADJUSTMENT_VALUES`
    - Responsive: sliders stack vertically full-width on screens < 768px
    - WithSwag design system: primary #6366f1, border-radius 8px, Inter font, consistent shadows
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 4.2 Write property tests for reset and slider isolation
    - **Property 9: Reset restores default values**
    - Generate random `AdjustmentValues`, apply reset, verify equals `DEFAULT_ADJUSTMENT_VALUES`
    - **Property 10: Slider change updates only the target parameter**
    - Generate random slider key, value, and initial values; verify only target key changes
    - Create in `EasyPortrait/src/__tests__/AdjustmentPanel.test.tsx`
    - **Validates: Requirements 4.2, 2.4**

  - [ ]* 4.3 Write unit tests for AdjustmentPanel rendering
    - 7 sliders rendered with correct labels and Lucide icons
    - Each slider has `<label>` with matching `for`/`id`
    - Reset All button exists and resets values
    - Numeric value displayed next to each slider
    - Error handling: preview error shows unadjusted image with warning (Req 8.2)
    - _Requirements: 2.1, 2.2, 4.1, 7.2, 8.2_

- [x] 5. Integrate adjustment step into EditorPage
  - [x] 5.1 Update `EditorPage.tsx` to add the adjust step
    - Add `'adjust'` to `EditorStep` union type
    - Add `adjustmentValues` state initialized to `DEFAULT_ADJUSTMENT_VALUES`
    - Update `stepLabels` and `stepMap` to include "Adjust" between Background and Download
    - Update progress bar to show Adjust step for both single and collage flows
    - Background step "Next" navigates to `'adjust'` instead of `'preview'`/`'layout'`
    - Adjust step "Back" navigates to `'background'`
    - Adjust step "Next" navigates to `'preview'`/`'layout'` with adjustments applied
    - Render `<AdjustmentPanel>` when `step === 'adjust'`
    - Browser compatibility check: if Canvas API unsupported, skip adjust step (Req 8.3)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.3_

  - [ ]* 5.2 Write unit tests for editor navigation with adjust step
    - Create `EasyPortrait/src/__tests__/editorNavigation.test.tsx`
    - Test navigation flow: background → adjust → preview
    - Test progress bar labels include "Adjust"
    - Test back button from adjust goes to background
    - Test canvas API unsupported → adjust step skipped
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.3_

- [x] 6. Integrate adjustments into download pipeline
  - [x] 6.1 Update `PhotoPreview.tsx` to apply adjustments at full resolution
    - Accept new prop `adjustmentValues?: AdjustmentValues`
    - After drawing cropped/processed image on download canvas, call `applyAdjustmentsToCanvas` before download
    - Apply adjustments at full output resolution (selected DPI), not preview resolution
    - Error handling: if adjustment fails, fall back to unadjusted canvas with warning toast
    - _Requirements: 6.1, 6.2, 6.4, 8.1_

  - [x] 6.2 Update collage generation in `EditorPage.tsx` to apply adjustments per tile
    - In `handleGenerateCollage`, apply adjustments to source image at full resolution before tiling
    - Each tile in the collage includes adjustments
    - _Requirements: 6.3, 6.4_

  - [ ]* 6.3 Write unit tests for download pipeline with adjustments
    - Test single photo download includes adjustments
    - Test collage download applies adjustments per tile
    - Test full-resolution output (not preview resolution)
    - Test fallback on adjustment failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement landing page feature showcase
  - [x] 8.1 Add Photo Adjustments showcase card (Card 4) to `LandingPage.tsx`
    - Add card to hero section following existing card pattern (outer glow, white rounded-xl container)
    - Use `samplePhoto4` (lady with scarf image) for before/after demo
    - Implement animated before/after slider with CSS `clipPath` and `requestAnimationFrame` (3s ping-pong cycle)
    - Render pill buttons for Brightness (Sun), Contrast (Contrast), Saturation (Palette) with auto-cycling active highlight (2s interval)
    - Footer label: Sun icon + "Photo Adjustments — Fine-Tune Your Look" + "NEW" badge
    - Add `adjustSliderPos` and `activeAdjustIndex` state with animation effects
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 8.2 Replace home button emoji with Lucide Home icon in `LandingPage.tsx`
    - Replace `🏠` emoji with `<Home className="h-5 w-5" />` from lucide-react
    - Keep surrounding `<a>` tag and Tailwind classes unchanged
    - _Requirements: 9.7_

  - [x] 8.3 Update "How It Works" section in `LandingPage.tsx`
    - Add "Adjust" step at position 4 with desc "Fine-tune brightness & more"
    - Shift Choose Size to step 5, Download to step 6
    - Change grid from `md:grid-cols-5` to `md:grid-cols-6`
    - _Requirements: 9.6_

  - [ ]* 8.4 Write unit tests for landing page showcase
    - Create `EasyPortrait/src/__tests__/LandingPageShowcase.test.tsx`
    - Test Card 4 renders with samplePhoto4 image
    - Test three adjustment pill buttons render with Lucide icons
    - Test footer label contains "Photo Adjustments" and "NEW" badge
    - Test "How It Works" has 6 steps with "Adjust" at position 4
    - Test home button uses Lucide Home icon (not emoji)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 9. Implement cross-app navigation for EasyPortrait
  - [x] 9.1 Create `AppSwitcher` component at `EasyPortrait/src/components/AppSwitcher.tsx`
    - Fixed button at top-4 right-4 z-50 with Lucide `LayoutGrid` icon (or `X` when open)
    - Desktop (≥768px): absolute dropdown w-72, white rounded-xl, shadow, "WithSwag Tools" header, tool links with icon/name/description
    - Mobile (<768px): fixed bottom sheet with bg-black/30 backdrop, rounded-t-2xl white panel
    - Icon mapping: `{ Camera, FileText }` from lucide-react
    - Close on outside click (mousedown listener) and Escape key (keydown listener)
    - `aria-label="Open app switcher"`, `aria-expanded` toggled with state
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.11, 10.12_

  - [x] 9.2 Create `Breadcrumbs` component at `EasyPortrait/src/components/Breadcrumbs.tsx`
    - `<nav aria-label="Breadcrumb">` with flex layout
    - Items: `<a href="/">WithSwag</a>` → ChevronRight → toolName → optional ChevronRight → currentStep
    - Lucide `ChevronRight` separator at size 14
    - Styling: text-sm text-gray-500 font-medium, hover:text-indigo-600 on links
    - _Requirements: 10.7, 10.11_

  - [x] 9.3 Integrate AppSwitcher and Breadcrumbs into `LandingPage.tsx` and `EditorPage.tsx`
    - LandingPage: render `<AppSwitcher />` and `<Breadcrumbs toolName="Portrait Photo" />`
    - EditorPage: render `<AppSwitcher />` and `<Breadcrumbs toolName="Portrait Photo" currentStep={stepLabels[step]} />`
    - _Requirements: 10.3, 10.7_

  - [ ]* 9.4 Write property tests for app registry (Property 11)
    - **Property 11: App registry entries have required fields**
    - Create `EasyPortrait/src/__tests__/apps.test.ts`
    - Verify every entry in `WITHSWAG_APPS` has non-empty name, path, icon, description
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 9.5 Write unit tests for AppSwitcher component
    - Create `EasyPortrait/src/__tests__/AppSwitcher.test.tsx`
    - **Property 12: AppSwitcher dropdown lists all registered tools**
    - Test renders LayoutGrid icon button at top-right
    - Test clicking opens dropdown with all tools listed
    - Test clicking outside closes dropdown
    - Test pressing Escape closes dropdown
    - Test mobile viewport renders bottom sheet
    - Test button toggles aria-expanded
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.11, 10.12**

  - [ ]* 9.6 Write unit tests for Breadcrumbs component
    - Create `EasyPortrait/src/__tests__/Breadcrumbs.test.tsx`
    - **Property 13: Navigation elements have required accessibility attributes**
    - Test renders nav with aria-label="Breadcrumb"
    - Test shows "WithSwag > Portrait Photo" on LandingPage
    - Test shows "WithSwag > Portrait Photo > {step}" on EditorPage
    - Test ChevronRight separator rendered between items
    - **Validates: Requirements 10.7, 10.11**

- [x] 10. Implement cross-app navigation for SRT Editor
  - [x] 10.1 Add navigation components to `srt-editor/index.html`
    - Add inline `WITHSWAG_APPS` JavaScript constant with Portrait Photo and SRT Editor entries
    - Replace existing 🏠 emoji home button with inline SVG Lucide Home icon, link to `/`
    - Add `.ws-home-btn` CSS: fixed top-left, white/90 backdrop-blur, rounded-lg shadow, hover scale
    - Add App Switcher: `<div class="ws-app-switcher">` with LayoutGrid SVG button, hidden dropdown populated from WITHSWAG_APPS
    - Add CSS for desktop dropdown and mobile bottom sheet (@media max-width: 767px)
    - Add JS: toggle, outside-click close, Escape close, aria-expanded toggle
    - Add Breadcrumbs: `<nav class="ws-breadcrumbs" aria-label="Breadcrumb">` with WithSwag link, ChevronRight SVG, "SRT Editor" span
    - All CSS follows WithSwag design system: #6366f1 primary, Inter font, 8px border-radius
    - _Requirements: 10.2, 10.8, 10.9, 10.10, 10.11, 10.12_

  - [ ]* 10.2 Write unit tests for SRT Editor navigation
    - Test home button uses SVG Home icon (not 🏠 emoji) and links to "/"
    - Test app switcher renders and toggles dropdown
    - Test breadcrumb shows "WithSwag > SRT Editor"
    - _Requirements: 10.8, 10.9, 10.10_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (Properties 1–13) validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The adjustment engine is implemented first as a pure function to enable early testing before UI integration
- All TypeScript with React, Tailwind CSS, Lucide React icons, and fast-check for property testing
