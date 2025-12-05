export type PrayerSpot = {
  name: string;
  spotType: "masjid" | "prayer_room" | "restaurant" | "cafe";
  location: {
    lat: number;
    lng: number;
    geopoint: string;
    geohash?: string;
  };
  address: string;
  directions: string;
  googleMapsUrl: string;
  googlePlaceId: string;
  amenities: {
    wudu: boolean;
    women: boolean;
    toilets?: boolean;
    disabilityAccess?: boolean;
  };
  openingHours?: {
    [day: string]: { open: string; close: string }[];
  };
  availability: "public" | "private" | "customers_only" | "students_only";
  capacityHint?: "small" | "medium" | "large" | "unknown";
  multiFaith?: boolean;
  sectNotes?: string | null;
  verified: boolean;
  source: "scraped" | "user";
  ownerId: string;
  images: {
    url: string;
    storage: "firebase" | "s3";
    bucket?: string | null;
    key?: string | null;
    width?: number;
    height?: number;
  }[];
  createdAt: string;
  updatedAt: string;
  dedupeKey: string;
};

export type User = {
  id: string;
  displayName: string;
  email: string;
  joinedAt: number;
};

export interface SpotMarker {
  id: string; // Firebase document ID - always present from doc.id
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  images: {
    url: string;
    path?: string | null;
    createdBy: string;
    width?: number;
    height?: number;
  }[];
  amenities: {
    toilets: boolean;
    women: boolean;
    wudu: boolean;
    disabilityAccess: boolean;
  };
  spotType: "masjid" | "prayer_room" | "restaurant" | "cafe";
  address: string; // added from Nominatim
  googleMapsUrl?: string; // added for "Get Directions"
  verified?: boolean;
}
