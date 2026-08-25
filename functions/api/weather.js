const CITIES = {
  kabul: { name: "کابل", latitude: 34.5553, longitude: 69.2075 },
  herat: { name: "هرات", latitude: 34.3529, longitude: 62.2040 },
  kandahar: { name: "قندهار", latitude: 31.6289, longitude: 65.7372 },
  mazar: { name: "مزار شریف", latitude: 36.7069, longitude: 67.1128 },
  balkh: { name: "بلخ", latitude: 36.7564, longitude: 66.8972 },
  jalalabad: { name: "جلال‌آباد", latitude: 34.4340, longitude: 70.4477 },
  bamyan: { name: "بامیان", latitude: 34.8100, longitude: 67.8212 },
  kunduz: { name: "قندوز", latitude: 36.7280, longitude: 68.8570 },
  ghazni: { name: "غزنی", latitude: 33.5539, longitude: 68.4209 },
  faizard: { name: "فیض‌آباد", latitude: 37.1166, longitude: 70.5800 },
  saripul: { name: "سرپل", latitude: 35.9990, longitude: 65.7600 }
};

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "public, max-age=300"
    }
  });
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);

    const requestedCity =
      (url.searchParams.get("city") || "Kabul").trim();

    const key = requestedCity
      .toLowerCase()
      .replace(/\s+/g, "");

    const city =
      CITIES[key] ||
      Object.values(CITIES).find(
        c => c.name === requestedCity
      );

    if (!city) {
      return json({
        success: false,
        error: "شهر پیدا نشد",
        availableCities: Object.values(CITIES).map(c => c.name)
      }, 404);
    }

    const apiUrl = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

    apiUrl.searchParams.set("latitude", city.latitude);
    apiUrl.searchParams.set("longitude", city.longitude);

    apiUrl.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m"
      ].join(",")
    );

    apiUrl.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "sunrise",
        "sunset"
      ].join(",")
    );

    apiUrl.searchParams.set("timezone", "auto");
    apiUrl.searchParams.set("forecast_days", "7");

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      return json({
        success: false,
        error: "سرویس آب‌وهوا پاسخ نداد"
      }, 502);
    }

    const data = await response.json();

    return json({
      success: true,
      source: "Open-Meteo",
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: data.timezone,
      current: data.current,
      daily: data.daily,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    return json({
      success: false,
      error: "خطا در دریافت اطلاعات آب‌وهوا",
      details: error.message
    }, 500);
  }
       }
