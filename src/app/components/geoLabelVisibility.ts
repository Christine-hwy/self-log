import { GeoLabel, CityTier } from '../../data/geoLabels';

export const CITY_TIER_ALTITUDE: Record<CityTier, number> = {
  tier1: 2.0, // tier1 cities visible once altitude < 2.0
  tier2: 1.2, // tier2 cities visible once altitude < 1.2
  tier3: 0.6, // tier3 cities visible once altitude < 0.6
};

export const COUNTRY_HIDE_ALTITUDE = 0.6; // countries hidden once altitude < 0.6

/**
 * Pure function: given the full label dataset and current camera altitude,
 * returns only the labels that should be rendered (i.e. passed into
 * htmlElementsData), filtering out everything else so far-fewer DOM nodes
 * exist at any given zoom level.
 */
export function getVisibleGeoLabels(labels: GeoLabel[], altitude: number): GeoLabel[] {
  return labels.filter((label) => {
    if (label.kind === 'country') {
      return altitude >= COUNTRY_HIDE_ALTITUDE;
    }
    // city
    const threshold = CITY_TIER_ALTITUDE[label.tier as CityTier];
    return altitude < threshold;
  });
}
