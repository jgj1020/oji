"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
} from "lucide-react";

import styles from "./nearby.module.css";
import ManualPlaceSearch from "@/components/ManualPlaceSearch";
import { locationErrorMessage } from "@/lib/location";

import {
  getTodayPlan,
  toggleTodayPlan,
  onTodayPlanChange,
  type TodayPlanPlace,
} from "@/lib/todayPlan";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RealPlace = {
  id: string;
  place_name: string;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  place_url: string;
};

const QUICK_SEARCHES = [
  "카페",
  "노래방",
  "볼링장",
  "맛집",
  "PC방",
  "영화관",
  "방탈출",
];

function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }

  return `${(distance / 1000).toFixed(1)}km`;
}

export default function NearbyPage() {
  const [coords, setCoords] =
    useState<Coordinates | null>(null);

  const [input, setInput] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [radius, setRadius] =
    useState(3000);

  const [places, setPlaces] =
    useState<RealPlace[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [todayPlan, setTodayPlan] =
    useState<TodayPlanPlace[]>([]);

  const selectedPlace =
    todayPlan[todayPlan.length - 1] ?? null;

  const [searchHistory, setSearchHistory] =
    useState<string[]>([]);

  useEffect(() => {
    setInput(new URLSearchParams(window.location.search).get("query")?.trim() ?? "");
    const historyRaw =
      localStorage.getItem("oji-search-history");

    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);

        if (Array.isArray(parsed)) {
          setSearchHistory(parsed);
        }
      } catch {
        localStorage.removeItem(
          "oji-search-history"
        );
      }
    }

    setTodayPlan(getTodayPlan());

    const cleanupPlan =
      onTodayPlanChange(() => {
        setTodayPlan(getTodayPlan());
      });

    getLocation();

    return cleanupPlan;
  }, []);


  // AUTO ACTIVITY PLACE SEARCH
  useEffect(() => {
    if (!coords) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const initialQuery =
      params.get("query")?.trim();

    if (!initialQuery) {
      return;
    }

    setInput(initialQuery);

    searchPlaces(initialQuery);
  }, [coords]);
  function getLocation() {
    if (!navigator.geolocation) {
      setError(
        "이 기기에서는 위치 기능을 사용할 수 없어."
      );
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setCoords(nextCoords);

        localStorage.setItem(
          "oji-location",
          JSON.stringify(nextCoords)
        );

        setLocationLoading(false);
      },

      (error) => {
        setLocationLoading(false);

        setError(
          locationErrorMessage(error.code)
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  async function searchPlaces(
    nextQuery?: string
  ) {
    const searchQuery =
      (nextQuery ?? input).trim();

    if (!searchQuery) {
      setError(
        "찾고 싶은 장소를 입력해줘."
      );
      return;
    }

    if (!coords) {
      setError(
        "먼저 현재 위치를 불러와줘."
      );
      return;
    }

    setQuery(searchQuery);
    setInput(searchQuery);

    setSearchHistory((prev) => {
      const next = [
        searchQuery,
        ...prev.filter(
          (item) => item !== searchQuery
        ),
      ].slice(0, 8);

      localStorage.setItem(
        "oji-search-history",
        JSON.stringify(next)
      );

      return next;
    });

    setLoading(true);
    setError("");

    try {
      const params =
        new URLSearchParams({
          query: searchQuery,

          lat: String(
            coords.latitude
          ),

          lng: String(
            coords.longitude
          ),

          radius: String(radius),
          limit: "30",
        });

      const response =
        await fetch(
          `/backend-api/real-places?${params}`
        );

      if (!response.ok) {
        throw new Error(
          "장소 검색 실패"
        );
      }

      const data: RealPlace[] =
        await response.json();

      setPlaces(data);

      if (data.length === 0) {
        setError(
          `${radius / 1000}km 안에서 검색 결과를 찾지 못했어.`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "실제 장소를 불러오지 못했어. 백엔드가 실행 중인지 확인해줘."
      );
    } finally {
      setLoading(false);
    }
  }

  function choosePlace(
    place: RealPlace
  ) {
    const next =
      toggleTodayPlan(place);

    setTodayPlan(next);
  }

  return (
    <main className={styles.page}>

      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="홈으로 돌아가기"
          onClick={() =>
            window.location.href = "/"
          }
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <span>NEARBY</span>
          <h1>내 주변 장소 찾기</h1>
        </div>
      </header>

      <section className={styles.searchSection}>

        <div className={styles.searchBox}>
          <Search size={18} />

          <input
            aria-label="주변 장소 검색"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchPlaces();
              }
            }}
            placeholder="카페, 볼링장, 노래방..."
          />

          <button
            type="button"
            onClick={() =>
              searchPlaces()
            }
          >
            찾기
          </button>
        </div>

        <div className={styles.quickSearch}>
          {QUICK_SEARCHES.map(
            (item) => (
              <button
                type="button"
                key={item}
                className={
                  query === item
                    ? styles.quickActive
                    : ""
                }
                onClick={() =>
                  searchPlaces(item)
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        {searchHistory.length > 0 && (
          <div className={styles.historyArea}>
            <div className={styles.historyHead}>
              <span>최근 검색</span>

              <button
                type="button"
                onClick={() => {
                  setSearchHistory([]);

                  localStorage.removeItem(
                    "oji-search-history"
                  );
                }}
              >
                전체 삭제
              </button>
            </div>

            <div className={styles.historyList}>
              {searchHistory.map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      searchPlaces(item)
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <div className={styles.options}>
          <div className={styles.radius}>
            {[1000, 3000, 5000].map(
              (value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    radius === value
                      ? styles.radiusActive
                      : ""
                  }
                  onClick={() =>
                    setRadius(value)
                  }
                >
                  {value / 1000}km
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className={styles.locationButton}
            onClick={getLocation}
          >
            {locationLoading ? (
              <LoaderCircle
                size={15}
                className={styles.spin}
              />
            ) : (
              <LocateFixed size={15} />
            )}

            내 위치
          </button>
        </div>

      </section>

      {selectedPlace && (
        <section className={styles.todayPlace}>
          <div className={styles.todayIcon}>
            <Check
              size={17}
              strokeWidth={3}
            />
          </div>

          <div className={styles.todayInfo}>
            <Link className="course-view-link" href="/course">오늘 코스 {todayPlan.length}곳 · 전체 보기 →</Link>

            <strong>
              {selectedPlace.place_name}
            </strong>

            <small>
              {formatDistance(
                selectedPlace.distance_m
              )}
              {" · "}
              {selectedPlace.address}
            </small>
          </div>

          <button
            type="button"
            onClick={() =>
              window.open(
                selectedPlace.place_url,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <Navigation size={16} />
          </button>
        </section>
      )}

      {!coords && (
        <section className={styles.locationEmpty}>
          <MapPin size={24} />

          <strong>
            내 위치가 필요해
          </strong>

          <p>
            현재 위치를 기준으로 가까운 장소를 찾아줄게.
          </p>

          <button
            type="button"
            onClick={getLocation}
          >
            위치 사용하기
          </button>
        </section>
      )}

      {loading && (
        <div className={styles.loading}>
          <LoaderCircle
            size={22}
            className={styles.spin}
          />

          가까운 장소 찾는 중...
        </div>
      )}

      {!loading && error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {!coords && !locationLoading && <ManualPlaceSearch activity={input || "놀거리"} />}

      {!loading &&
        places.length > 0 && (
          <section className={styles.results}>

            <div className={styles.resultHead}>
              <div>
                <span>
                  SEARCH RESULT
                </span>

                <h2>
                  {query}
                </h2>
              </div>

              <strong>
                {places.length}곳
              </strong>
            </div>

            <div className={styles.list}>
              {places.map(
                (place, index) => {
                  const selected =
                    selectedPlace?.id ===
                    place.id;

                  return (
                    <article
                      key={place.id}
                      className={
                        selected
                          ? `${styles.card} ${styles.cardSelected}`
                          : styles.card
                      }
                    >

                      <div className={styles.cardTop}>
                        <span>
                          {index + 1}
                        </span>

                        <strong>
                          {formatDistance(
                            place.distance_m
                          )}
                        </strong>
                      </div>

                      <small className={styles.category}>
                        {place.category
                          ?.split(">")
                          .slice(-1)[0]
                          ?.trim()}
                      </small>

                      <h3>
                        {place.place_name}
                      </h3>

                      <p>
                        <MapPin size={13} />
                        {place.address}
                      </p>

                      {place.phone && (
                        <p>
                          <Phone size={13} />
                          {place.phone}
                        </p>
                      )}

                      <div className={styles.actions}>

                        <button
                          type="button"
                          className={
                            selected
                              ? styles.choiceSelected
                              : styles.choice
                          }
                          onClick={() =>
                            choosePlace(place)
                          }
                        >
                          {selected ? (
                            <>
                              <Check
                                size={14}
                                strokeWidth={3}
                              />
                              코스에 담았어
                            </>
                          ) : (
                            "여기 갈래"
                          )}
                        </button>

                        {place.phone && (
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => {
                              window.location.href =
                                `tel:${place.phone}`;
                            }}
                          >
                            <Phone size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() =>
                            window.open(
                              place.place_url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          <ExternalLink size={15} />
                        </button>

                      </div>
                    </article>
                  );
                }
              )}
            </div>

          </section>
        )}

    </main>
  );
}
