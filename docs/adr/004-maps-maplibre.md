# ADR 004 · MapLibre GL with OpenFreeMap tiles

**Status:** Accepted, Day 0.

## Context

Plan sec 61 lists Google Maps or Mapbox and says to choose on cost, quality in AP, limits and licensing. For a 20 day MVP we need maps today, with no billing account and no key management.

## Decision

MapLibre GL JS (open source fork of Mapbox GL) through `react-map-gl/maplibre`, with the free, keyless OpenFreeMap vector tiles (`liberty` style). Our own route lines, stops and bus markers are drawn as GeoJSON layers.

## Consequences

- Zero cost, no key, no usage caps for the demo.
- OpenFreeMap has no SLA. For production the same code can switch the style URL to a paid provider (MapTiler, Mapbox) or self hosted tiles, which keeps the sec 61 decision open for the authority.
- No routing or traffic API. ETA uses our own schedule based math ([13](../13-realtime-tracking.md)), which the plan requires anyway (numbers from fixed calculations, sec 73).
