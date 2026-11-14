<template>
  <div class="map-board">
    <div
      ref="container"
      class="map"
      role="application"
      aria-label="Carte interactive : clique sur le lieu demandé"
    ></div>
    <div class="controls">
      <button
        type="button"
        aria-label="Zoomer"
        title="Zoomer"
        @click="map?.zoomIn()"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Dézoomer"
        title="Dézoomer"
        @click="map?.zoomOut()"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 12h14"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Recentrer la carte"
        title="Recentrer la carte"
        @click="recenter(true)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M12 2v4M12 18v4M2 12h4M18 12h4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Leaflet is driven directly (no wrapper component) so that region and marker
// styles can follow the game state on every device: the previous wrapper only
// repainted a region on mouseout, which never fires on touch screens.
//
// There is no tile basemap: everything is drawn from GeoJSON on a plain "sea"
// background, so the maps do not depend on a third-party tile service.
import { onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection } from "geojson";
import { useGameStore } from "../../store/game";

const props = defineProps<{
  /** Region outlines: the playable regions, or the backdrop of a "points" map. */
  geo: FeatureCollection | null;
}>();

const game = useGameStore();
const container = ref<HTMLElement | null>(null);

let map: L.Map | undefined;
let group: L.LayerGroup | undefined;
let resizeObserver: ResizeObserver | undefined;
const layers = new Map<string, L.Path[]>();
let hoveredId: string | null = null;

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function readPalette() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    region: token("--map-region"),
    inert: token("--map-inert"),
    stroke: token("--map-stroke"),
    ok: token("--ok"),
    bad: token("--bad"),
    warn: token("--warn"),
  };
}
let palette = readPalette();

const isPoints = () => game.mode?.map?.kind === "points";

function styleFor(id: string): L.CircleMarkerOptions {
  const state = game.status[id];
  const flash = game.flash?.id === id ? game.flash.kind : null;
  const hovered = hoveredId === id && state !== "done";
  const points = isPoints();

  let color = palette.region;
  let fillOpacity = points ? 0.85 : 0.3;
  if (state === "done") {
    color = palette.ok;
    fillOpacity = points ? 1 : 0.7;
  }
  if (flash === "wrong") {
    color = palette.bad;
    fillOpacity = points ? 1 : 0.7;
  } else if (flash === "reveal") {
    color = palette.warn;
    fillOpacity = points ? 1 : 0.85;
  }
  if (hovered) fillOpacity = Math.min(fillOpacity + 0.2, 1);

  if (points) {
    return {
      radius: hovered || flash ? 11 : 8,
      color: palette.stroke,
      weight: 2,
      fillColor: color,
      fillOpacity,
    };
  }
  return {
    color,
    weight: hovered || flash ? 2.5 : 1,
    fillColor: color,
    fillOpacity,
  };
}

function restyle(id: string | null | undefined) {
  if (!id) return;
  const style = styleFor(id);
  layers.get(id)?.forEach((layer) => {
    layer.setStyle(style);
    if (game.flash?.id === id || hoveredId === id) layer.bringToFront();
  });
}

function restyleAll() {
  for (const id of layers.keys()) restyle(id);
}

function register(id: string, layer: L.Path) {
  const list = layers.get(id);
  if (list) list.push(layer);
  else layers.set(id, [layer]);

  layer.on({
    click: () => game.guessChoice(id),
    mouseover: () => {
      hoveredId = id;
      restyle(id);
    },
    mouseout: () => {
      if (hoveredId === id) hoveredId = null;
      restyle(id);
    },
  });
}

function recenter(animate: boolean) {
  const config = game.mode?.map;
  if (!map || !config) return;
  map.fitBounds(config.bounds(game.continent), { animate });
}

function build() {
  const config = game.mode?.map;
  if (!map || !config) return;

  group?.remove();
  layers.clear();
  hoveredId = null;
  group = L.layerGroup().addTo(map);
  const inertStyle: L.PathOptions = {
    color: palette.stroke,
    weight: 0.6,
    fillColor: palette.inert,
    fillOpacity: 1,
  };

  if (config.kind === "regions") {
    if (!props.geo) return;
    const key = config.featureKey ?? "id";
    const idOf = (feature?: Feature) =>
      String(feature?.properties?.[key] ?? "");
    const playable = new Set(game.choices.map((choice) => choice.id));

    // Regions outside this game (other continents, territories) stay visible
    // for context but cannot be clicked.
    L.geoJSON(props.geo, {
      filter: (feature) => !playable.has(idOf(feature)),
      interactive: false,
      style: inertStyle,
    }).addTo(group);

    L.geoJSON(props.geo, {
      filter: (feature) => playable.has(idOf(feature)),
      style: (feature) => styleFor(idOf(feature)),
      onEachFeature: (feature, layer) =>
        register(idOf(feature), layer as L.Path),
    }).addTo(group);
  } else {
    // Markers need land underneath to be findable: draw the outlines as a
    // plain, non-clickable backdrop.
    if (props.geo) {
      L.geoJSON(props.geo, { interactive: false, style: inertStyle }).addTo(
        group,
      );
    }
    for (const choice of game.choices) {
      if (choice.lat === undefined || choice.lng === undefined) continue;
      const marker = L.circleMarker(
        [choice.lat, choice.lng],
        styleFor(choice.id),
      );
      marker.addTo(group);
      register(choice.id, marker);
    }
  }
  recenter(false);
}

function onThemeChange() {
  palette = readPalette();
  build();
}

onMounted(() => {
  if (!container.value) return;
  map = L.map(container.value, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 0.5, // lets a whole country/continent fit on a phone screen
    maxZoom: 11,
    zoomSnap: 0.25,
    maxBounds: [
      [-85, -220],
      [85, 220],
    ],
    maxBoundsViscosity: 0.8,
  });
  build();

  resizeObserver = new ResizeObserver(() => map?.invalidateSize());
  resizeObserver.observe(container.value);
  darkQuery.addEventListener("change", onThemeChange);
});

// A new round (or new map data) rebuilds the layers; within a round only the
// styles change.
watch([() => game.choices, () => props.geo], build);
watch(() => game.status, restyleAll, { deep: true });
watch(
  () => game.flash,
  (now, before) => {
    restyle(before?.id);
    restyle(now?.id);
  },
);

onUnmounted(() => {
  darkQuery.removeEventListener("change", onThemeChange);
  resizeObserver?.disconnect();
  map?.remove();
  map = undefined;
  layers.clear();
});
</script>

<style scoped lang="scss">
.map-board {
  position: relative;
  flex: 1;
  min-height: 0;
}

.map {
  position: absolute;
  inset: 0;
  background: var(--map-sea);
  font-family: var(--font-body);

  :deep(.leaflet-interactive:focus) {
    outline: none;
  }
}

.controls {
  position: absolute;
  z-index: 1000;
  right: 12px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  overflow: hidden;

  button {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    color: var(--ink);

    &:hover {
      background: var(--surface-2);
    }

    & + button {
      border-top: 1px solid var(--line);
    }
  }
}
</style>
