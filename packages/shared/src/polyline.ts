/**
 * Google Encoded Polyline Algorithm Format implementation.
 * Encodes and decodes an array of [lat, lng] tuples to and from a compact string.
 * Precision: 5 decimal places (factor of 1e5).
 */

export type Coordinate = [latitude: number, longitude: number];

function encodeSignedNumber(num: number): string {
  let sgnNum = num < 0 ? ~(num << 1) : num << 1;
  let encodeString = "";

  while (sgnNum >= 0x20) {
    encodeString += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
    sgnNum >>= 5;
  }

  encodeString += String.fromCharCode(sgnNum + 63);
  return encodeString;
}

/**
 * Encodes a series of [latitude, longitude] pairs into a polyline string.
 */
export function encodePolyline(coordinates: readonly Coordinate[] | Coordinate[]): string {
  if (coordinates.length === 0) {
    return "";
  }

  let result = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);

    const dLat = latE5 - prevLat;
    const dLng = lngE5 - prevLng;

    prevLat = latE5;
    prevLng = lngE5;

    result += encodeSignedNumber(dLat);
    result += encodeSignedNumber(dLng);
  }

  return result;
}

/**
 * Decodes an encoded polyline string into an array of [latitude, longitude] pairs.
 */
export function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}
