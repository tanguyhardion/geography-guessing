import type { FeatureCollection } from "geojson";

const cache = new Map<string, Promise<FeatureCollection>>();

/** Fetch a GeoJSON file once per session. Failed requests can be retried. */
export function loadGeoJson(url: string): Promise<FeatureCollection> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return response.json() as Promise<FeatureCollection>;
    });
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}
