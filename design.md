---
version: "alpha"
name: "Coinara — Trade, Save, and Grow"
description: "Coinara Trade Login Section is designed for authenticating users through a focused access flow. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for authentication screens in web products."
colors:
  primary: "#060B19"
  secondary: "#3C78AA"
  tertiary: "#C2A633"
  neutral: "#000000"
  background: "#000000"
  surface: "#060B19"
  text-primary: "#FFFFFF"
  text-secondary: "#083344"
  border: "#FFFFFF"
  accent: "#060B19"
typography:
  display-lg:
    fontFamily: "DM Sans"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: "72px"
    letterSpacing: "-0.025em"
    textTransform: "uppercase"
  body-md:
    fontFamily: "System Font"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  full: "9999px"
spacing:
  base: "4px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  gap: "4px"
  card-padding: "10px"
  section-padding: "40px"
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "8px"
  button-secondary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "10px"
  button-link:
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "8px"
  card:
    rounded: "24px"
    padding: "20px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #060B19 as the main accent and #000000 as the neutral foundation.

- **Primary (#060B19):** Main accent and emphasis color.
- **Secondary (#3C78AA):** Supporting accent for secondary emphasis.
- **Tertiary (#C2A633):** Reserved accent for supporting contrast moments.
- **Neutral (#000000):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #000000; Surface: #060B19; Text Primary: #FFFFFF; Text Secondary: #083344; Border: #FFFFFF; Accent: #060B19

## Typography

Typography pairs DM Sans for display hierarchy with System Font for supporting content and interface copy.

- **Display (`display-lg`):** DM Sans, 72px, weight 300, line-height 72px, letter-spacing -0.025em, uppercase.
- **Body (`body-md`):** System Font, 12px, weight 500, line-height 16px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 4px, 6px, 8px, 10px, 12px, 14px, 16px, 20px
- **Section padding:** 40px, 60px
- **Card padding:** 10px, 11.5px, 13px, 16px
- **Gaps:** 4px, 6px, 8px, 10px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 1px #FFFFFF; 1px #6EA8DC; 1px #96C8FF
- **Shadows:** rgba(6, 182, 212, 0.35) 0px 0px 24px 0px; rgba(0, 0, 0, 0.5) 0px 30px 80px 0px, rgba(80, 150, 220, 0.15) 0px 0px 60px 0px; rgba(6, 182, 212, 0.25) 0px 0px 16px 0px
- **Blur:** 12px, 18px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 20px padding and a 24px radius. Drive the shell with linear-gradient(160deg, rgba(34, 54, 92, 0.75), rgba(14, 28, 42, 0.85)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 12px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 12px, 16px, 24px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 8px, border 1px solid rgba(255, 255, 255, 0.14).
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 10px, border 1px solid rgba(255, 255, 255, 0.18).
- **Links:** text #FFFFFF, radius 9999px, padding 8px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** border 1px solid rgba(150, 200, 255, 0.22), radius 24px, padding 20px, shadow rgba(0, 0, 0, 0.5) 0px 30px 80px 0px, rgba(80, 150, 220, 0.15) 0px 0px 60px 0px, blur 18px.
- **Card surface:** background rgba(0, 0, 0, 0.25), border 1px solid rgba(255, 255, 255, 0.1), radius 16px, padding 16px, shadow none.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 12px, 16px, 24px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 150ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and color changes.

**Motion Level:** moderate

**Durations:** 150ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** text, color, brightness

## WebGL

Reconstruct the graphics as a centered hero field using antialias, dpr clamp, custom shaders. The effect should read as technical, meditative, and atmospheric: noise haze with black and sparse spacing. Build it from shader field so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Centered hero field
  - **Effect:**
    - **Value:** Noise haze
  - **Primitives:**
    - **Value:** Shader field
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** antialias, DPR clamp, custom shaders

**Techniques:** Breathing pulse, Pointer parallax, Shader gradients, Noise fields, DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL beam -->
      <canvas id="beam" class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>

      <!-- ambient glows -->
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      attribute vec2 p;
        void main(){ gl_Position = vec4(p,0.,1.); }
      `;
      const fsrc = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_res;
      …
      ```
  - **Renderer setup:**
    - **Language:** js
    - **Snippet:**
      ```
      void main(){ gl_Position = vec4(p,0.,1.); }
      `;
      const fsrc = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_res;

        float hash(float n){ return fract(sin(n)*43758.5453); }
      …
      ```
