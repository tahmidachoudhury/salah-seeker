# Data Model for Users and Listings

> Created: 03.10.25

> Updated: 03.10.25

## User Interface

```ts
export type User = {
  id: string;
  displayName: string;
  email: string;
  joinedAt: number;
};
```

This is the current User Interface, minimal for quick deployment.

## Listing Interface

```ts
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
```

This is the original plan for the listing interface. It is very verbose, the version used during MVP is very minimal and I have been slowly adding more and more properties to that version, so it eventually looks like this.
