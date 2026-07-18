import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveCityIcon } from '../../data/cityIcons';
import { TravelMemory } from '../../data/site';

export const MARKER_ICON_SIZE_PX = 22;
/** Lifts the badge above its anchor point so it clears the geo-label text
 *  anchored at the same lat/lng, without touching the geo-label layer itself. */
export const MARKER_VERTICAL_OFFSET_PX = -16;

/**
 * Builds the bare-icon DOM element for a single Travel_Memory. No background
 * shape, border, or shadow container — just the flat-color icon SVG with a
 * drop-shadow filter for legibility against the globe's varying colors.
 * Purely decorative: pointer-events is disabled so clicks/hovers pass through
 * to the invisible point-layer hit-target beneath it.
 */
export function createMemoryBadgeElement(memory: TravelMemory): HTMLDivElement {
  const Icon = resolveCityIcon(memory.location);
  const iconSvg = renderToStaticMarkup(
    createElement(Icon, {
      size: MARKER_ICON_SIZE_PX,
    })
  );

  // The outer element's own `transform` is overwritten every frame by
  // three-globe's CSS2DRenderer (it uses that property to position the
  // element on screen), so the vertical offset must live on an inner
  // wrapper instead of the returned element itself.
  const el = document.createElement('div');
  el.setAttribute('data-memory-badge', memory.id);
  el.style.cssText = `
    pointer-events: none;
  `;

  const inner = document.createElement('div');
  inner.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(${MARKER_VERTICAL_OFFSET_PX}px);
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7));
  `;
  inner.innerHTML = iconSvg;

  el.appendChild(inner);
  return el;
}
