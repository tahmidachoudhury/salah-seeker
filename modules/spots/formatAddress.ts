interface addressDetails {
  road?: string;
  city?: string;
  city_district?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  suburb?: string;
  "ISO3166-2-lvl4"?: string;
  "ISO3166-2-lvl8"?: string;
}

export default function getDisplayAddress(
  addressDetails: addressDetails | undefined,
  addressFallback: string
) {
  if (addressDetails) {
    const road = addressDetails.road || null;

    const postcode = addressDetails.postcode || null;

    // If both available → best case
    if (road && postcode) return `${road}, ${postcode}`;

    // One part missing → return whatever exists
    if (road) return road;
    if (postcode) return postcode;
  }

  // Full fallback (always present)
  if (!addressFallback) return "Unknown location";

  const truncated =
    addressFallback.length > 15
      ? addressFallback.slice(0, 35) + "…" // Unicode ellipsis for nicer look
      : addressFallback;

  return truncated;
}
