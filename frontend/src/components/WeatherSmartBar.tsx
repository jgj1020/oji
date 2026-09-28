"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from "lucide-react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Weather = {
  temperature_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
};

type Props = {
  coords: Coordinates | null;
  onApply: (environment: "ALL" | "INDOOR" | "OUTDOOR") => void;
  onRequestLocation: () => void;
};

function getEnvironment(weather: Weather): "INDOOR" | "OUTDOOR" {
  const badWeather =
    weather.precipitation > 0 ||
    weather.weather_code >= 51;

  const tooHot =
    weather.apparent_temperature >= 32;

  const tooCold =
    weather.apparent_temperature <= 3;

  const tooWindy =
    weather.wind_speed_10m >= 35;

  if (
    badWeather ||
    tooHot ||
    tooCold ||
    tooWindy
  ) {
    return "INDOOR";
  }

  return "OUTDOOR";
}

function getWeatherLabel(code: number) {
  if (code === 0) return "맑음";
  if (code <= 3) return "구름";
  if (code <= 48) return "흐림";
  if (code <= 67) return "비";
  if (code <= 77) return "눈";
  if (code <= 82) return "소나기";
  if (code >= 95) return "천둥";

  return "흐림";
}

function WeatherIcon({
  code,
}: {
  code: number;
}) {
  if (code === 0) {
    return <Sun size={14} />;
  }

  if (code <= 3) {
    return <CloudSun size={14} />;
  }

  if (code <= 48) {
    return <Cloud size={14} />;
  }

  if (code <= 67 || code >= 80) {
    return <CloudRain size={14} />;
  }

  if (code <= 77) {
    return <Snowflake size={14} />;
  }

  return <Cloud size={14} />;
}

export default function WeatherSmartBar({
  coords,
  onApply,
  onRequestLocation,
}: Props) {
  const [environment, setEnvironment] =
    useState("ALL");

  const [enabled, setEnabled] =
    useState(true);

  const [weather, setWeather] =
    useState<Weather | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!coords) {
      setWeather(null);
      return;
    }

    const currentCoords = coords;
    const controller = new AbortController();

    async function loadWeather() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          latitude: String(currentCoords.latitude),
          longitude: String(currentCoords.longitude),
          current:
            "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
          timezone: "auto",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const current: Weather = data.current;

        setWeather(current);

        const recommended =
          getEnvironment(current);

        setEnvironment(recommended);

        if (enabled) {
          onApply(recommended);
        }
      } catch {
        // 날씨 조회 실패 시 기존 추천 유지
      } finally {
        setLoading(false);
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [coords]);

  function toggleWeather() {
    if (!coords) {
      onRequestLocation();
      return;
    }

    if (enabled) {
      setEnabled(false);
      onApply("ALL");
    } else {
      setEnabled(true);
      onApply(environment as "INDOOR" | "OUTDOOR");
    }
  }

  return (
    <div className="weather-simple-bar">
      <strong>날씨 맞춤 추천</strong>

      <div className="weather-simple-right">
        <div className="weather-current">
          {!coords ? (
            <span>위치 필요</span>
          ) : loading ? (
            <span>확인 중</span>
          ) : weather ? (
            <>
              <WeatherIcon
                code={weather.weather_code}
              />

              <span>
                {getWeatherLabel(
                  weather.weather_code
                )}
              </span>

              <b>
                {Math.round(
                  weather.temperature_2m
                )}
                °
              </b>
            </>
          ) : (
            <span>날씨 없음</span>
          )}
        </div>

        <button
          type="button"
          className={
            enabled
              ? "weather-simple-toggle active"
              : "weather-simple-toggle"
          }
          onClick={toggleWeather}
          aria-pressed={enabled}
        >
          <span className="weather-toggle-label">
            {enabled ? "ON" : "OFF"}
          </span>

          <span className="weather-toggle-knob" />
        </button>
      </div>
    </div>
  );
}