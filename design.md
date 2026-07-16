---
version: "alpha"
name: "NXA — Decentralized AI Compute Protocol"
description: "Nxa Decentralized Card Component is designed for building reusable UI components in modern web projects. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#CFC8FF"
  secondary: "#CBD5E1"
  tertiary: "#B6A6F5"
  neutral: "#F1F5F9"
  background: "#CFC8FF"
  surface: "#CFC8FF"
  text-primary: "#CBD5E1"
  text-secondary: "#F1F5F9"
  accent: "#CFC8FF"
typography:
  display-lg:
    fontFamily: "Sora"
    fontSize: "48px"
    fontWeight: 300
    lineHeight: "48px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-md:
    fontFamily: "DM Sans"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  md: "0px"
  full: "9999px"
spacing:
  base: "8px"
  sm: "8px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  gap: "8px"
  section-padding: "52px"
components:
  button-primary:
    backgroundColor: "#FFFFFF"
    textColor: "#E2E8F0"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px"
  button-link:
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Bounded
  - Framing: Open
  - Grid: Strong

## Colors

The color system uses dark mode with #CFC8FF as the main accent and #F1F5F9 as the neutral foundation.

- **Primary (#CFC8FF):** Main accent and emphasis color.
- **Secondary (#CBD5E1):** Supporting accent for secondary emphasis.
- **Tertiary (#B6A6F5):** Reserved accent for supporting contrast moments.
- **Neutral (#F1F5F9):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #CFC8FF; Surface: #CFC8FF; Text Primary: #CBD5E1; Text Secondary: #F1F5F9; Accent: #CFC8FF

## Typography

Typography pairs Sora for display hierarchy with DM Sans for supporting content and interface copy.

- **Display (`display-lg`):** Sora, 48px, weight 300, line-height 48px, letter-spacing -0.025em.
- **Body (`body-md`):** DM Sans, 14px, weight 400, line-height 20px.
- **Labels (`label-md`):** DM Sans, 12px, weight 500, line-height 16px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, bounded structural frame before changing ornament or component styling. Use 8px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / bounded composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Bounded
- **Base unit:** 8px
- **Scale:** 8px, 10px, 16px, 20px, 24px, 28px, 32px, 40px
- **Section padding:** 52px
- **Gaps:** 8px, 10px, 28px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Shadows:** rgba(139, 124, 246, 0.18) 0px 0px 0px 1px, rgba(109, 84, 235, 0.25) 0px 0px 80px 0px, rgba(0, 0, 0, 0.8) 0px 40px 120px 0px; rgba(255, 255, 255, 0.14) 0px 0px 0px 1px inset; rgba(255, 255, 255, 0.16) 0px 0px 0px 1px inset, rgba(124, 93, 250, 0.25) 0px 0px 24px 0px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 24px radius. Drive the shell with linear-gradient(rgb(13, 10, 36) 0%, rgb(8, 6, 23) 55%, rgb(7, 5, 18) 100%) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 24px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 24px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles.

### Buttons
- **Primary:** background #FFFFFF, text #E2E8F0, radius 9999px, padding 8px, border 0px solid rgb(229, 231, 235).
- **Links:** text #CBD5E1, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 8px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 24px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Timing clusters around 150ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and brightness changes.

**Motion Level:** minimal

**Durations:** 150ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** text, brightness

## WebGL

Reconstruct the graphics as a centered hero field using alpha, antialias, dpr clamp, custom shaders. The effect should read as technical, meditative, and atmospheric: noise haze with indigo on black and dense spacing. Build it from shader field so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

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
    - **Value:** alpha, antialias, DPR clamp, custom shaders

**Techniques:** Breathing pulse, Pointer parallax, Shader gradients, Noise fields, DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL orb -->
      <div id="orbWrap" class="relative" style="width:min(20rem,70vw);height:min(20rem,70vw);opacity:0;">
        <canvas id="orb" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block" style="width:200%;height:200%;max-width:none;" role="img" aria-label="Animated energy sphere"></canvas>
      </div>
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      s.style.cssText = 'position:absolute;border-radius:9999px;background:#cfc8ff;' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'left:' + (Math.random()*100) + '%;top:' + (Math.random()*100) + '%;' +
            'opacity:' + (Math.random()*0.5 + 0.1) + ';';
          wrap.appendChild(s);
          s.animate(
            [{opacity: 0.05},{opacity: Math.random()*0.8 + 0.2},{opacity: 0.05}],
            {duration: 2200 + Math.random()*3800, iterations: Infinity, delay: Math.random()*3000, easing:'ease-in-out'}
      …
      ```
  - **Animation loop:**
    - **Language:** js
    - **Snippet:**
      ```
      'width:' + size + 'px;height:' + size + 'px;' +
          'left:' + (Math.random()*100) + '%;top:' + (Math.random()*100) + '%;' +
          'opacity:' + (Math.random()*0.5 + 0.1) + ';';
        wrap.appendChild(s);
        s.animate(
          [{opacity: 0.05},{opacity: Math.random()*0.8 + 0.2},{opacity: 0.05}],
          {duration: 2200 + Math.random()*3800, iterations: Infinity, delay: Math.random()*3000, easing:'ease-in-out'}
        );
      …
      ```
