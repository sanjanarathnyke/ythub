# Collapsible Accordion for Format & Quality Guide

## Goal
Replace the always-visible bottom "Format & Quality Guide" section in `frontend/index.html` with a collapsible accordion that matches the dark technical theme and feels less intrusive.

## Changes

### 1. Update HTML structure
- Keep the same `.lower` wrapper and `.panel-title` bar
- Replace the `.guide` grid with an accordion pattern:
  - A visible header bar (`.accordion-header`) containing the scribble text and a chevron icon
  - A hidden content panel (`.accordion-body`) containing the existing MP4/MP3 guide columns
- Add `overflow: hidden` on the body so animation clips correctly
- Add inline chevron markup (`▾` or SVG) that rotates on open

### 2. Update CSS
- `.accordion-header`: clickable row matching `.panel-title` styling, with pointer cursor and hover state
- `.accordion-body`: starts with `max-height: 0` and `opacity: 0`, transitions to `max-height` and `opacity: 1`
- Use `transition: max-height 0.35s ease, opacity 0.25s ease` for smooth expand/collapse
- Chevron rotation: `transform: rotate(180deg)` when open
- Ensure `.guide` grid styling remains unchanged inside the body

### 3. Update JavaScript
- Add a single click listener on `.accordion-header`
- Toggle an `.open` class on the parent accordion container
- No extra JS libraries; use classList toggle only

## Acceptance Criteria
- Default view shows only the accordion header bar (no guide text visible)
- Clicking the header smoothly expands the full guide content
- Clicking again collapses it back
- Chevron rotates 180 degrees on expand
- Works on mobile (`max-width: 760px`) without layout breakage
- No changes to backend or other functionality

## Out of Scope
- Adding tooltips, sidebar panels, or other progressive disclosure patterns
- Changing the guide content itself
