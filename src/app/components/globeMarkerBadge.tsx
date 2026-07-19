import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveCityIcon } from '../../data/cityIcons';
import { TravelMemory } from '../../data/site';

export const MARKER_ICON_SIZE_PX = 22;
/** Lifts the badge above its anchor point so it clears the geo-label text
 *  anchored at the same lat/lng, without touching the geo-label layer itself.
 *  Slightly larger magnitude than the icon-only version since the group is
 *  now taller (icon + name label stacked). */
export const MARKER_VERTICAL_OFFSET_PX = -20;

/**
 * Builds the icon + name-label DOM element for a single Travel_Memory. No
 * background shape or border — just the flat-color icon SVG (with a
 * drop-shadow filter for legibility against the globe's varying colors)
 * stacked above the memory's location name, matching the geo-label text
 * styling used elsewhere on the globe. Purely decorative: pointer-events is
 * disabled so clicks/hovers pass through to the invisible point-layer
 * hit-target beneath it.
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

  // Groups the icon and its name label into a single lifted unit: a
  // vertical flex column so the label sits directly beneath the icon.
  const inner = document.createElement('div');
  inner.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    transform: translateY(${MARKER_VERTICAL_OFFSET_PX}px);
  `;

  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7));
  `;
  // Safe: iconSvg is generated locally by renderToStaticMarkup from a known
  // icon component (no user-controlled data), unlike the location name
  // below, which is inserted via textContent rather than mixed into this
  // HTML string.
  iconWrapper.innerHTML = iconSvg;

  const nameLabel = document.createElement('div');
  nameLabel.style.cssText = `
    font-size: 11px;
    font-weight: 500;
    color: rgba(226, 232, 240, 0.9);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  `;
  // Uses textContent (not innerHTML) so a memory's location string can
  // never be interpreted as HTML, even if it contains `<`, `>`, or `&`.
  nameLabel.textContent = memory.location;

  inner.appendChild(iconWrapper);
  inner.appendChild(nameLabel);
  el.appendChild(inner);
  return el;
}
