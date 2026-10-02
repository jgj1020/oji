"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSun, Snowflake, Sun, RefreshCw, MapPin } from "lucide-react";

type Weather = {
  temperature_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  time: string;
};
type Props = {
  coords: { latitude: number; longitude: number } | null;
  onApply: (environment: "ALL" | "INDOOR" | "OUTDOOR") => void;
  onRequestLocation: () => void;
};

function describe(weather: Weather) {
  const code = weather.weather_code;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "눈", Icon: Snowflake };
  if (code >= 95) return { label: "뇌우", Icon: CloudRain };
  if (weather.precipitation > 0 || code >= 51) return { label: code >= 80 ? "소나기" : "비", Icon: CloudRain };
  if (code === 0) return { label: "맑음", Icon: Sun };
  if (code <= 3) return { label: "구름", Icon: CloudSun };
  return { label: "안개", Icon: Cloud };
}

export default function WeatherSmartBar({ coords, onApply, onRequestLocation }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [result, setResult] = useState<{ key: string; weather: Weather | null; failed: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const key = coords ? `${coords.latitude},${coords.longitude}` : "";
  const weather = result?.key === key ? result.weather : null;
  const failed = result?.key === key && result.failed;
  const loading = Boolean(key && result?.key !== key);

  useEffect(() => {
    if (!key) return;
    const [latitude, longitude] = key.split(",");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    async function load() {
      try {
        const params = new URLSearchParams({ latitude, longitude,
          current: "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
          timezone: "auto" });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Weather unavailable");
        const data = await response.json();
        const current = data.current as Weather;
        if (!current || ![current.temperature_2m, current.apparent_temperature, current.precipitation, current.weather_code, current.wind_speed_10m].every(Number.isFinite)) throw new Error("Invalid weather");
        if (active) setResult({ key, weather: current, failed: false });
      } catch {
        if (active) setResult({ key, weather: null, failed: true });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [key, retry]);

  const indoor = weather ? weather.precipitation > 0 || weather.weather_code >= 51 || weather.apparent_temperature >= 32 || weather.apparent_temperature <= 3 || weather.wind_speed_10m >= 35 : false;
  useEffect(() => {
    onApply(enabled && weather ? (indoor ? "INDOOR" : "OUTDOOR") : "ALL");
  }, [enabled, weather, indoor, onApply]);
  const summary = weather ? describe(weather) : null;
  const Icon = summary?.Icon ?? CloudSun;

  return <section className="weather-card" aria-label="현재 위치 날씨">
    <div className="weather-card-head">
      <strong><Icon size={18} /> 날씨 맞춤</strong>
      <button className={`weather-switch ${enabled ? "is-on" : ""}`} type="button" aria-label="날씨 맞춤 추천" aria-pressed={enabled}
        onClick={() => setEnabled(value => !value)}>{enabled ? "ON" : "OFF"}<span /></button>
    </div>
    <div className="weather-card-content" aria-live="polite">
      {!coords ? <><p>현재 위치를 확인하면 비·눈과 기온을 알려줘.</p><button className="weather-location-action" onClick={onRequestLocation}><MapPin size={15} />현재 위치 확인</button></>
      : loading ? <p>현재 위치의 날씨를 확인하고 있어…</p>
      : failed ? <><p>날씨를 불러오지 못했어. 다시 확인해줘.</p><button className="weather-location-action" onClick={() => { setResult(null); setRetry(value => value + 1); }}><RefreshCw size={15} />다시 확인</button></>
      : weather && <>
        <div className="weather-reading"><b>{Math.round(weather.temperature_2m)}°</b><span>{summary?.label}<small>체감 {Math.round(weather.apparent_temperature)}° · 강수량 {weather.precipitation}mm</small></span></div>
        <p>{enabled ? (indoor ? "지금은 실내 활동을 추천해." : "지금은 야외 활동을 추천해.") : "날씨만 표시 중 · 추천에는 반영하지 않아."}</p>
        <small className="weather-source">현재 위치 기준 · {weather.time?.slice(11,16)} 업데이트 · Open-Meteo</small>
      </>}
    </div>
  </section>;
}
