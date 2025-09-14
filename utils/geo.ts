// This uses the haversine formula to find the shortest distance across two points (user and spot) on the Earth.
// Technically, for small distances like 1-5 miles I don't need this, but it's good practice if I want to
// expand radius filtering 👍🏾👍🏾

export const getDistanceMiles = (
  lat1: number, //user lat
  lng1: number, //user lng
  lat2: number, //spot lat
  lng2: number //spot lng
) => {
  const R = 3958.8; // radius of Earth in miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
