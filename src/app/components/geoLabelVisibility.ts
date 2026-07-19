import { GeoLabel } from '../../data/geoLabels';

/**
 * Pure function: given the full label dataset, returns only the
 * country-kind labels. City labels are no longer rendered on the globe
 * at any zoom level, so this always returns the same country subset
 * regardless of camera altitude.
 */
export function getVisibleGeoLabels(labels: GeoLabel[], altitude: number): GeoLabel[] {
  return labels.filter((label) => label.kind === 'country');
}
