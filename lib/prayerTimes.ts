export const fetchPrayerTimes = async (lat: number, lng: number) => {
  const today = new Date();
  const date = `${today.getDate()}-${
    today.getMonth() + 1
  }-${today.getFullYear()}`;

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=4` // using method 4 - Umm Al-Qura University, Makkah
  );
  const data = await res.json();

  return data.data.timings;
};

export const getNextPrayer = (timings: Record<string, string>) => {
  const now = new Date();

  // Order matters
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const prayer of order) {
    const [h, m] = timings[prayer].split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);

    if (prayerTime > now) {
      const diffMs = prayerTime.getTime() - now.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin >= 60) {
        const hours = Math.floor(diffMin / 60);
        const minutes = diffMin % 60;
        return {
          name: prayer,
          formatted:
            minutes > 0
              ? `in ${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${
                  minutes > 1 ? "s" : ""
                }`
              : `in ${hours} hour${hours > 1 ? "s" : ""}`,
        };
      } else {
        return {
          name: prayer,
          formatted: `in ${diffMin} minute${diffMin !== 1 ? "s" : ""}`,
        };
      }
    }
  }

  // If all passed → next day Fajr
  const [h, m] = timings["Fajr"].split(":").map(Number);
  return {
    name: "Fajr",
    formatted: `tomorrow at ${h}:${m.toString().padStart(2, "0")}am`,
  };
};
