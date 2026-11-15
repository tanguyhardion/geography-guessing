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
/** Hint circle, answer label and marker ring for the current question. */
let helpGroup: L.LayerGroup | undefined;
let revealedId: string | null = null;
/** The view moved away from the round's framing to show a hint/answer. */
let movedForHelp = false;

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
  const revealed = revealedId === id;

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
  if (revealed) {
    color = palette.warn;
    fillOpacity = points ? 1 : 0.85;
  }
  if (hovered) fillOpacity = Math.min(fillOpacity + 0.2, 1);

  if (points) {
    return {
      radius: revealed ? 12 : hovered || flash ? 11 : 8,
      color: palette.stroke,
      weight: 2,
      fillColor: color,
      fillOpacity,
    };
  }
  return {
    color,
    weight: revealed ? 3 : hovered || flash ? 2.5 : 1,
    fillColor: color,
    fillOpacity,
  };
}

function restyle(id: string | null | undefined) {
  if (!id) return;
  const style = styleFor(id);
  layers.get(id)?.forEach((layer) => {
    layer.setStyle(style);
    if (game.flash?.id === id || hoveredId === id || revealedId === id) {
      layer.bringToFront();
    }
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

// --- Hint and answer -------------------------------------------------------

/**
 * Bounds of the main part of a choice: its largest ring for a region (so that
 * France is framed on Europe, not stretched to French Guiana), its position
 * for a marker.
 */
function mainBounds(id: string): L.LatLngBounds | null {
  let best: L.LatLngBounds | null = null;
  let bestArea = -1;
  const visit = (node: unknown) => {
    if (!Array.isArray(node) || node.length === 0) return;
    if (node[0] instanceof L.LatLng) {
      const bounds = L.latLngBounds(node as L.LatLng[]);
      const area =
        (bounds.getNorth() - bounds.getSouth()) *
        (bounds.getEast() - bounds.getWest());
      if (area > bestArea) {
        best = bounds;
        bestArea = area;
      }
    } else {
      node.forEach(visit);
    }
  };
  for (const layer of layers.get(id) ?? []) {
    if (layer instanceof L.CircleMarker) {
      const at = layer.getLatLng();
      return L.latLngBounds(at, at);
    }
    if (layer instanceof L.Polyline) visit(layer.getLatLngs());
  }
  return best;
}

/** Diagonal of the round's framing, in metres: scales the hint zone. */
function framingSize(): number {
  const config = game.mode?.map;
  if (!map || !config) return 0;
  const [sw, ne] = config.bounds(game.continent);
  return map.distance(sw, ne);
}

function framingZoom(): number {
  const config = game.mode?.map;
  if (!map || !config) return 0;
  return map.getBoundsZoom(config.bounds(game.continent));
}

function clearHelp() {
  helpGroup?.clearLayers();
  const previous = revealedId;
  revealedId = null;
  if (previous) {
    layers
      .get(previous)
      ?.forEach((layer) => layer.getElement()?.classList.remove("is-revealed"));
    restyle(previous);
  }
}

let flyFrame = 0;

/**
 * Fly once the prompt above the map has grown to show the hint or answer: a
 * resize of the map during the flight would cancel it.
 */
function flyAfterLayout(bounds: L.LatLngBounds, options: L.FitBoundsOptions) {
  window.cancelAnimationFrame(flyFrame);
  flyFrame = window.requestAnimationFrame(() => {
    flyFrame = window.requestAnimationFrame(() => {
      if (!map) return;
      map.invalidateSize({ pan: false });
      map.flyToBounds(bounds, options);
    });
  });
}

/** Draw a dashed zone that contains the answer, a little off-centre. */
function showHint() {
  const id = game.current?.targetId;
  const bounds = id ? mainBounds(id) : null;
  if (!map || !helpGroup || !bounds) return;

  const centre = bounds.getCenter();
  const halfDiagonal =
    map.distance(bounds.getSouthWest(), bounds.getNorthEast()) / 2;
  const radius = Math.max(halfDiagonal * 1.6, framingSize() * 0.07);
  // Shift the centre so the answer is inside the zone but not at its heart.
  const angle = Math.random() * 2 * Math.PI;
  const shift = (radius - halfDiagonal) * 0.5 * Math.random();
  const metresPerDegree = 111_320;
  const zoneCentre = L.latLng(
    centre.lat + (shift * Math.sin(angle)) / metresPerDegree,
    centre.lng +
      (shift * Math.cos(angle)) /
        (metresPerDegree * Math.cos((centre.lat * Math.PI) / 180)),
  );

  const zone = L.circle(zoneCentre, {
    radius,
    interactive: false,
    color: palette.warn,
    weight: 2.5,
    dashArray: "8 7",
    fillColor: palette.warn,
    fillOpacity: 0.08,
    className: "hint-zone",
  }).addTo(helpGroup);
  flyAfterLayout(zone.getBounds(), {
    padding: [40, 40],
    maxZoom: framingZoom() + 3,
    duration: 0.8,
  });
  movedForHelp = true;
}

/** Highlight the answer, label it and bring it into view. */
function showAnswer() {
  const id = game.current?.targetId;
  const bounds = id ? mainBounds(id) : null;
  if (!map || !helpGroup || !id || !bounds) return;

  revealedId = id;
  restyle(id);
  layers
    .get(id)
    ?.forEach((layer) => layer.getElement()?.classList.add("is-revealed"));

  const points = isPoints();
  const centre = bounds.getCenter();
  if (points) {
    L.circleMarker(centre, {
      radius: 22,
      interactive: false,
      color: palette.warn,
      weight: 3,
      fill: false,
      className: "reveal-ring",
    }).addTo(helpGroup);
  }
  L.tooltip({
    permanent: true,
    direction: "top",
    offset: points ? [0, -14] : [0, 0],
    className: "answer-label",
  })
    .setLatLng(points ? centre : L.latLng(bounds.getNorth(), centre.lng))
    .setContent(game.answerLabel)
    .addTo(helpGroup);

  flyAfterLayout(bounds, {
    padding: [80, 80],
    maxZoom: framingZoom() + 2.5,
    duration: 0.9,
  });
  movedForHelp = true;
}

function build() {
  const config = game.mode?.map;
  if (!map || !config) return;

  group?.remove();
  helpGroup?.remove();
  layers.clear();
  hoveredId = null;
  revealedId = null;
  movedForHelp = false;
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
  // Above the regions, so the answer label is never hidden.
  helpGroup = L.layerGroup().addTo(map);
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
watch(
  () => game.hint,
  (hint) => {
    if (hint && !game.revealed) showHint();
  },
);
watch(
  () => game.revealed,
  (revealed) => {
    if (!revealed) return;
    clearHelp();
    showAnswer();
  },
);
// Next question: drop the help and go back to the round's framing.
watch(
  () => game.current?.key,
  () => {
    clearHelp();
    const config = game.mode?.map;
    if (movedForHelp && config) {
      movedForHelp = false;
      flyAfterLayout(L.latLngBounds(config.bounds(game.continent)), {
        duration: 0.7,
      });
    }
  },
);

onUnmounted(() => {
  window.cancelAnimationFrame(flyFrame);
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

  :deep(.is-revealed) {
    animation: reveal-pulse 1.1s ease-in-out infinite;
  }

  :deep(.reveal-ring) {
    transform-box: fill-box;
    transform-origin: center;
    animation: reveal-ring 1.4s ease-out infinite;
  }

  :deep(.hint-zone) {
    animation: zone-in 0.5s ease;
  }

  :deep(.answer-label) {
    padding: 5px 12px;
    border: 1.5px solid var(--warn);
    border-radius: 999px;
    background: var(--surface);
    color: var(--warn);
    box-shadow: var(--shadow-2);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 800;
    white-space: nowrap;

    &::before {
      border-top-color: var(--warn);
    }
  }
}

@keyframes reveal-pulse {
  50% {
    stroke-width: 6px;
    stroke-opacity: 0.55;
  }
}

@keyframes reveal-ring {
  from {
    transform: scale(0.5);
    opacity: 1;
  }
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes zone-in {
  from {
    opacity: 0;
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
