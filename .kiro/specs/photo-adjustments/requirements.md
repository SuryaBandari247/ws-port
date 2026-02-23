# Requirements Document

## Introduction

The EasyPortrait app currently supports uploading, cropping, background removal/replacement, and downloading passport photos. This feature adds a photo adjustment step that allows users to fine-tune image properties such as brightness, contrast, saturation, exposure, face lighting, sharpness, and warmth. The adjustment UI follows the same sidebar-plus-main-area layout used by the existing crop and background steps, with real-time preview of changes applied to the cropped photo. Adjustments are applied via Canvas 2D pixel manipulation before the final download, and all slider values are reset-able to defaults. The feature is also showcased on the EasyPortrait landing page with an animated before/after preview card.

## Glossary

- **Adjustment_Panel**: The sidebar UI component that contains labeled sliders for each photo adjustment parameter
- **Preview_Canvas**: The main-area canvas element that displays the cropped photo with adjustments applied in real time
- **Adjustment_Engine**: The utility module that applies pixel-level image transformations (brightness, contrast, saturation, exposure, warmth, sharpness, face lighting) to a canvas
- **Adjustment_Values**: An object holding the numeric value for each adjustment parameter, with each value defaulting to its neutral midpoint
- **Editor_Page**: The existing page component (`EditorPage.tsx`) that orchestrates the multi-step passport photo editing workflow
- **Photo_Pipeline**: The sequence of image transformations from crop through background replacement through adjustments to final download

## Requirements

### Requirement 1: Adjustment Step in Editor Workflow

**User Story:** As a user, I want a dedicated adjustment step in the editor workflow, so that I can fine-tune my photo after cropping and background selection but before downloading.

#### Acceptance Criteria

1. WHEN the user completes the background step and clicks the "Next" button, THE Editor_Page SHALL navigate to an "Adjust" step before the preview/download step.
2. THE Editor_Page SHALL display the Adjust step in the progress bar between the Background step and the Download step for both single and collage flows.
3. WHEN the user clicks the "Back" button on the Adjust step, THE Editor_Page SHALL navigate back to the Background step.
4. WHEN the user clicks the "Next" button on the Adjust step, THE Editor_Page SHALL navigate to the preview/download step with all adjustments applied.

### Requirement 2: Adjustment Sliders

**User Story:** As a user, I want sliders for common photo adjustments, so that I can control each property independently.

#### Acceptance Criteria

1. THE Adjustment_Panel SHALL provide labeled range sliders for the following parameters: Brightness, Contrast, Saturation, Exposure, Warmth, Sharpness, and Face Lighting.
2. THE Adjustment_Panel SHALL display each slider with a numeric value label showing the current value.
3. THE Adjustment_Panel SHALL initialize all slider values to their neutral midpoint (zero effect) when the Adjust step is first entered.
4. WHEN the user moves a slider, THE Adjustment_Panel SHALL update the corresponding value in the Adjustment_Values object.
5. THE Adjustment_Panel SHALL constrain each slider value to a defined minimum and maximum range (e.g., -100 to +100 for Brightness, Contrast, Saturation, Exposure, and Warmth; 0 to +100 for Sharpness and Face Lighting).

### Requirement 3: Real-Time Preview

**User Story:** As a user, I want to see the effect of my adjustments in real time, so that I can make informed decisions before downloading.

#### Acceptance Criteria

1. WHEN the user changes any slider value, THE Preview_Canvas SHALL render the cropped photo with all current Adjustment_Values applied within 200 milliseconds.
2. THE Preview_Canvas SHALL apply adjustments on top of the background-replaced image when a background color has been selected, or on top of the original cropped image when no background replacement is active.
3. THE Preview_Canvas SHALL maintain the same aspect ratio and display size as the cropped photo preview used in the background step.
4. WHILE adjustments are being computed, THE Preview_Canvas SHALL continue displaying the previous frame without flickering or blank states.

### Requirement 4: Reset Adjustments

**User Story:** As a user, I want to reset all adjustments to their defaults, so that I can start over without navigating away.

#### Acceptance Criteria

1. THE Adjustment_Panel SHALL provide a "Reset All" button.
2. WHEN the user clicks the "Reset All" button, THE Adjustment_Panel SHALL set all Adjustment_Values back to their neutral midpoints.
3. WHEN the user clicks the "Reset All" button, THE Preview_Canvas SHALL re-render the photo with no adjustments applied.

### Requirement 5: Adjustment Engine — Pixel Transformations

**User Story:** As a developer, I want a dedicated utility module for applying pixel-level adjustments, so that the transformation logic is reusable and testable.

#### Acceptance Criteria

1. THE Adjustment_Engine SHALL accept a source canvas and an Adjustment_Values object and return a new canvas with all adjustments applied.
2. WHEN Brightness is set to a positive value, THE Adjustment_Engine SHALL increase the RGB values of each pixel proportionally. WHEN Brightness is set to a negative value, THE Adjustment_Engine SHALL decrease the RGB values proportionally.
3. WHEN Contrast is set to a positive value, THE Adjustment_Engine SHALL increase the difference of each pixel's RGB values from the midpoint (128). WHEN Contrast is set to a negative value, THE Adjustment_Engine SHALL decrease the difference.
4. WHEN Saturation is set to a positive value, THE Adjustment_Engine SHALL increase the color intensity of each pixel. WHEN Saturation is set to a negative value, THE Adjustment_Engine SHALL decrease the color intensity toward grayscale.
5. WHEN Exposure is set to a positive value, THE Adjustment_Engine SHALL multiply each pixel's RGB values by a factor greater than 1. WHEN Exposure is set to a negative value, THE Adjustment_Engine SHALL multiply by a factor less than 1.
6. WHEN Warmth is set to a positive value, THE Adjustment_Engine SHALL shift pixel colors toward warmer tones (increase red, decrease blue). WHEN Warmth is set to a negative value, THE Adjustment_Engine SHALL shift toward cooler tones (increase blue, decrease red).
7. WHEN Sharpness is set above zero, THE Adjustment_Engine SHALL apply an unsharp mask convolution to enhance edge detail.
8. WHEN Face Lighting is set above zero, THE Adjustment_Engine SHALL brighten the central region of the image (approximating face position) while leaving edges less affected.
9. THE Adjustment_Engine SHALL clamp all output pixel values to the 0–255 range.
10. WHEN all Adjustment_Values are at their neutral midpoints, THE Adjustment_Engine SHALL return a canvas with pixel data identical to the source canvas (identity property).

### Requirement 6: Adjustments Applied to Final Download

**User Story:** As a user, I want my adjustments to be included in the downloaded photo, so that the final output matches what I see in the preview.

#### Acceptance Criteria

1. WHEN the user proceeds to the preview/download step, THE Photo_Pipeline SHALL apply the current Adjustment_Values to the full-resolution cropped image (at the selected DPI) before rendering the download canvas.
2. WHEN the user downloads a single photo, THE Photo_Pipeline SHALL produce an image file that includes all adjustments.
3. WHEN the user downloads a collage, THE Photo_Pipeline SHALL apply adjustments to each individual photo tile before compositing the collage.
4. THE Photo_Pipeline SHALL apply adjustments at full output resolution, not at preview resolution.

### Requirement 7: Responsive and Accessible Adjustment UI

**User Story:** As a user on a mobile device or using assistive technology, I want the adjustment controls to be usable, so that I can edit my photo on any device.

#### Acceptance Criteria

1. THE Adjustment_Panel SHALL stack sliders vertically and use full-width layout on screens narrower than 768 pixels.
2. THE Adjustment_Panel SHALL render each slider as an HTML range input with an associated label element using a `for`/`id` attribute pair.
3. THE Adjustment_Panel SHALL support keyboard interaction on all sliders (arrow keys to increment/decrement).
4. THE Adjustment_Panel SHALL display sufficient color contrast between slider labels, values, and background to meet WCAG AA contrast ratio (4.5:1 for text).
5. THE Adjustment_Panel SHALL follow the WithSwag design system: primary color #6366f1, border-radius 8px for controls, Inter font family, and consistent shadow/transition styles.

### Requirement 8: Error Handling for Adjustment Processing

**User Story:** As a user, I want graceful handling of adjustment errors, so that I do not lose my work if something goes wrong.

#### Acceptance Criteria

1. IF the Adjustment_Engine fails to obtain a canvas 2D context, THEN THE Adjustment_Engine SHALL return the source canvas unmodified and log the error to the console.
2. IF the Preview_Canvas encounters an error during rendering, THEN THE Preview_Canvas SHALL display the unadjusted cropped image and show a non-blocking warning message.
3. IF the browser does not support the required Canvas API operations, THEN THE Editor_Page SHALL skip the Adjust step and proceed directly from Background to Preview/Download.

### Requirement 9: Landing Page Feature Showcase

**User Story:** As a visitor to the EasyPortrait landing page, I want to see a preview of the photo adjustment feature, so that I understand the tool's capabilities before starting.

#### Acceptance Criteria

1. THE LandingPage SHALL display a Photo Adjustments showcase card in the hero section, following the same visual pattern as the existing AI Background Removal, Smart Crop, and Sheet Sizes cards.
2. THE showcase card SHALL use one of the existing sample resource images (samplePhoto4 — the "lady with scarf" image) to demonstrate the adjustment effect.
3. THE showcase card SHALL display an animated before/after slider effect that auto-cycles, showing the original image on one side and a brightness/contrast-adjusted version on the other.
4. THE showcase card SHALL display pill buttons with Lucide React icons for Brightness, Contrast, and Saturation, auto-cycling the active highlight.
5. THE showcase card SHALL include a footer label with a Sun icon, the text "Photo Adjustments — Fine-Tune Your Look", and a "NEW" badge.
6. THE "How It Works" section SHALL be updated to include an "Adjust" step (step 4) between Background and Choose Size, updating the grid layout to accommodate the additional step.
7. THE LandingPage home button SHALL use a Lucide React `Home` icon (`<Home className="h-5 w-5" />`) instead of the existing 🏠 emoji, consistent with the Lucide React icon usage throughout the application.


### Requirement 10: Cross-App Navigation System

**User Story:** As a user navigating between WithSwag tools, I want a consistent navigation system across all tools, so that I can easily switch between tools and understand where I am in the platform.

#### Acceptance Criteria

1. THE EasyPortrait app SHALL define a shared `WITHSWAG_APPS` registry constant in `EasyPortrait/src/constants/apps.ts` containing an array of objects with `name`, `path`, `icon`, and `description` for each tool (Portrait Photo and SRT Editor).
2. THE SRT Editor SHALL define an equivalent inline `WITHSWAG_APPS` JavaScript constant containing the same tool entries.
3. THE EasyPortrait LandingPage and EditorPage SHALL render an `AppSwitcher` component fixed to the top-right corner, using the Lucide `LayoutGrid` icon as the trigger button.
4. WHEN the user clicks the AppSwitcher button on desktop (≥768px), THE AppSwitcher SHALL display a dropdown popover listing all tools from `WITHSWAG_APPS` with their icon, name, and description.
5. WHEN the user clicks the AppSwitcher button on mobile (<768px), THE AppSwitcher SHALL display a full-width bottom sheet listing all tools from `WITHSWAG_APPS`.
6. WHEN the user clicks outside the AppSwitcher dropdown or presses the Escape key, THE AppSwitcher SHALL close the dropdown.
7. THE EasyPortrait LandingPage and EditorPage SHALL render a `Breadcrumbs` component showing the navigation path `WithSwag > Portrait Photo` (and optionally the current step on EditorPage), using the Lucide `ChevronRight` icon as the separator.
8. THE SRT Editor SHALL render a Home button in the top-left corner using an inline SVG Lucide `Home` icon (replacing the existing 🏠 emoji), linking to `/`.
9. THE SRT Editor SHALL render an App Switcher in the top-right corner using an inline SVG Lucide `LayoutGrid` icon, with a dropdown listing all tools from the inline `WITHSWAG_APPS` constant, and a mobile bottom sheet for screens narrower than 768px.
10. THE SRT Editor SHALL render a Breadcrumb navigation showing `WithSwag > SRT Editor` using an inline SVG Lucide `ChevronRight` separator.
11. ALL navigation buttons SHALL include `aria-label` attributes, the AppSwitcher button SHALL toggle `aria-expanded`, breadcrumbs SHALL use `<nav aria-label="Breadcrumb">`, and all interactive elements SHALL have visible focus states.
12. THE AppSwitcher dropdown SHALL close when the user presses the Escape key, and all navigation touch targets SHALL be at least 44×44px on mobile.
