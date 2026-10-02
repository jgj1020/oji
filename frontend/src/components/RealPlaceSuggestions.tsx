"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import {
  getTodayPlan,
  toggleTodayPlan,
  removeTodayPlanPlace,
  onTodayPlanChange,
  type TodayPlanPlace,
} from "@/lib/todayPlan";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  X,
} from "lucide-react";

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

type Props = {
  activityName?: string;
  coords: Coordinates | null;
  onRequestLocation: () => void;
};

function activityToQuery(name: string) {
  const stopWords = new Set([
    "먹기",
    "먹으러",
    "먹으러가기",
    "가기",
    "가보기",
    "해보기",
    "하기",
    "즐기기",
    "즐겨보기",
    "체험하기",
    "구경하기",
    "보기",
    "치기",
    "타기",
    "방문하기",
    "놀기",
    "놀러가기",

    "친구랑",
    "친구와",
    "친구",
    "혼자",
    "같이",
    "함께",

    "오늘",
    "지금",
    "가볍게",
    "재밌게",

    "음식",
    "음식점",
    "먹거리",
    "맛집",

    "조합",
    "추천",
    "활동",
  ]);

  const cleaned = name
    .replace(/[(),!?]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !stopWords.has(word));

  if (cleaned.length === 0) {
    return name.trim();
  }

  return cleaned.join(" ");
}

function isCorrectPlace(
  place: RealPlace,
  query: string
) {
  const target = query.toLowerCase();

  const text =
    `${place.place_name} ${place.category}`
      .toLowerCase();

  const strictTargets: Record<string, string[]> = {
    "편의점": [
      "편의점",
      "cu",
      "gs25",
      "세븐일레븐",
      "이마트24",
    ],

    "노래방": [
      "노래방",
      "코인노래",
    ],

    "볼링장": [
      "볼링",
    ],

    "pc방": [
      "pc방",
      "피시방",
    ],

    "영화관": [
      "영화관",
      "cgv",
      "롯데시네마",
      "메가박스",
    ],

    "축구장": [
      "축구",
    ],

    "농구장": [
      "농구",
    ],

    "야구장": [
      "야구",
    ],

    "탁구장": [
      "탁구",
    ],

    "당구장": [
      "당구",
    ],

    "수영장": [
      "수영",
    ],

    "찜질방": [
      "찜질",
    ],

    "카페": [
      "카페",
      "커피",
    ],

    "공원": [
      "공원",
    ],

    "한강공원": [
      "한강",
      "공원",
    ],

    "치킨": [
      "치킨",
    ],

    "피자": [
      "피자",
    ],

    "떡볶이": [
      "떡볶이",
      "분식",
    ],

    "햄버거": [
      "햄버거",
      "버거",
    ],
  };

  const keywords =
    strictTargets[target];

  // 별도 제한이 없는 활동은 카카오 검색 결과 사용
  if (!keywords) {
    return true;
  }

  return keywords.some(
    (keyword) =>
      text.includes(keyword)
  );
}


function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w가-힣\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchCandidates(activityName: string) {
  const primary =
    normalizeSearchText(
      activityToQuery(activityName)
    );

  if (!primary) {
    return [];
  }

  const words = primary
    .split(/\s+/)
    .filter((word) => word.length >= 2);

  /*
   * 긴 단어를 우선 사용.
   * 길이가 같으면 뒤쪽 단어를 먼저 사용.
   *
   * 예:
   * "뜨끈한 국밥" -> "국밥"이 fallback에서 먼저 사용됨.
   * "보드게임 카페" -> "보드게임"이 먼저 사용됨.
   */
  const keywordCandidates = words
    .map((word, index) => ({
      word,
      index,
    }))
    .sort(
      (a, b) =>
        b.word.length - a.word.length ||
        b.index - a.index
    )
    .map((item) => item.word);

  return Array.from(
    new Set([
      primary,
      ...keywordCandidates,
    ])
  ).slice(0, 4);
}

function placeMatchesQuery(
  place: RealPlace,
  searchQuery: string
) {
  const placeText =
    normalizeSearchText(
      `${place.place_name} ${place.category}`
    );

  const tokens =
    normalizeSearchText(searchQuery)
      .split(/\s+/)
      .filter((word) => word.length >= 2);

  if (tokens.length === 0) {
    return true;
  }

  /*
   * 검색 대상 단어 중 최소 하나가
   * 장소명 또는 카카오 카테고리에 있어야 통과.
   *
   * 편의점 검색에 중국집이 끼는 식의 결과를 막음.
   */
  return tokens.some((token) =>
    placeText.includes(token)
  );
}
function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }

  return `${(distance / 1000).toFixed(1)}km`;
}

export default function RealPlaceSuggestions({
  activityName,
  coords,
  onRequestLocation,
}: Props) {
  const [places, setPlaces] = useState<RealPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const [radius, setRadius] = useState(3000);
  const [effectiveRadius, setEffectiveRadius] = useState(3000);
  const [reloadKey, setReloadKey] = useState(0);

  const [todayPlan, setTodayPlan] =
    useState<TodayPlanPlace[]>([]);

  const selectedPlace =
    todayPlan[todayPlan.length - 1] ?? null;

  const query = activityName ? activityToQuery(activityName) : "";

  useEffect(() => {
    const syncPlan = () => {
      setTodayPlan(getTodayPlan());
    };

    syncPlan();

    return onTodayPlanChange(syncPlan);
  }, []);

  useEffect(() => {
    if (!coords || !query) {
      return;
    }

    const controller =
      new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setFailed(false);

      /*
       * 카테고리/추천이 바뀌었는데
       * 이전 장소가 잠깐 남아있는 현상 방지
       */
      setPlaces([]);

      try {
        const currentCoords = coords;

        if (!currentCoords) {
          return;
        }

        const candidates =
          buildSearchCandidates(
            activityName ?? ""
          );

        /*
         * 현재 사용자가 고른 범위부터 검색.
         *
         * 1km -> 1, 3, 5km
         * 3km -> 3, 5km
         * 5km -> 5km
         */
        const radii = Array.from(
          new Set([
            radius,
            ...(radius < 3000
              ? [3000]
              : []),
            ...(radius < 5000
              ? [5000]
              : []),
          ])
        );

        async function searchOnce(
          searchQuery: string,
          searchRadius: number
        ) {
          if (!currentCoords) {
            throw new Error("위치 정보가 없습니다.");
          }

          const params =
            new URLSearchParams({
              query: searchQuery,
              lat: String(
                currentCoords.latitude
              ),
              lng: String(
                currentCoords.longitude
              ),
              radius: String(
                searchRadius
              ),
              limit: "30",
            });

          const response = await fetch(
            `/backend-api/real-places?${params}`,
            {
              signal:
                controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(
              "장소 검색 실패"
            );
          }

          const data: RealPlace[] =
            await response.json();

          /*
           * 카카오가 넓게 반환한 결과 중에서도
           * 현재 검색 대상과 관련된 장소만 남김.
           */
          return data.filter(
            (place) =>
              placeMatchesQuery(
                place,
                searchQuery
              )
          );
        }

        /*
         * 반경별로 검색하고,
         * 각 반경 안에서 검색어를 자동 완화.
         */
        for (
          const searchRadius of radii
        ) {
          for (
            const candidate of candidates
          ) {
            if (
              controller.signal.aborted
            ) {
              return;
            }

            console.log(
              `[OJI 장소검색] ${candidate} / ${searchRadius}m`
            );

            const found =
              await searchOnce(
                candidate,
                searchRadius
              );

            if (controller.signal.aborted) return;

            if (found.length > 0) {
              setPlaces(found);

              setEffectiveRadius(
                searchRadius
              );

              return;
            }
          }
        }

        /*
         * 모든 검색어 + 최대 반경까지 찾아도 없는 경우
         */
        setPlaces([]);

        setEffectiveRadius(
          radii[
            radii.length - 1
          ] ?? radius
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(error);
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPlaces();

    return () => {
      controller.abort();
    };
  }, [
    coords,
    query,
    radius,
    reloadKey,
    activityName,
  ]);

  function choosePlace(place: RealPlace) {
    const next = toggleTodayPlan(place);

    setTodayPlan(next);
  }

  function clearSelectedPlace() {
    if (!selectedPlace) return;

    const next = removeTodayPlanPlace(
      selectedPlace.id
    );

    setTodayPlan(next);
  }

  if (!activityName) return null;

  return (
    <section className="real-place-section compact">
      <div className="real-place-header compact">
        <div>
          <span className="real-place-kicker">
            REAL PLACE
          </span>

          <h3>실제로 갈 수 있는 곳</h3>

          <p>
            {query} · 가까운 순
          </p>
        </div>

        <button
          type="button"
          className="real-place-refresh"
          onClick={() =>
            setReloadKey((value) => value + 1)
          }
          aria-label="다시 찾기"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {!coords && (
        <button
          type="button"
          className="real-place-location"
          onClick={onRequestLocation}
        >
          <span className="real-place-location-icon">
            <MapPin size={19} />
          </span>

          <span>
            <strong>내 주변 장소 찾아보기</strong>
            <small>
              현재 위치를 기준으로 실제 장소를 찾아줘.
            </small>
          </span>

          <Navigation size={17} />
        </button>
      )}

      {coords && (
        <div className="real-place-toolbar">
          <div className="real-place-radius">
            {[
              { label: "1km", value: 1000 },
              { label: "3km", value: 3000 },
              { label: "5km", value: 5000 },
            ].map((item) => (
              <button
                type="button"
                key={item.value}
                className={
                  radius === item.value
                    ? "active"
                    : ""
                }
                onClick={() => setRadius(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="real-place-count">
            {places.length}곳 · {effectiveRadius / 1000}km
          </span>
        </div>
      )}

      {selectedPlace && (
        <div className="today-place-card">
          <div className="today-place-icon">
            <Check size={17} strokeWidth={3} />
          </div>

          <div className="today-place-info">
            <Link className="course-view-link" href="/course">오늘 코스 {todayPlan.length}곳 · 전체 보기 →</Link>

            <strong>
              {selectedPlace.place_name}
            </strong>

            <span>
              {formatDistance(
                selectedPlace.distance_m
              )}
              {" · "}
              {selectedPlace.address}
            </span>
          </div>

          <div className="today-place-actions">
            <button
              type="button"
              onClick={() =>
                window.open(
                  selectedPlace.place_url,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              title="길찾기"
            >
              <Route size={16} />
            </button>

            <button
              type="button"
              onClick={clearSelectedPlace}
              title="선택 취소"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {coords && loading && (
        <div className="real-place-loading">
          <LoaderCircle
            className="real-place-spinner"
            size={20}
          />

          가까운 장소 찾는 중...
        </div>
      )}

      {coords && !loading && failed && (
        <div className="real-place-message">
          장소를 불러오지 못했어.
        </div>
      )}

      {coords &&
        !loading &&
        !failed &&
        places.length === 0 && (
          <div className="real-place-message">
            이 거리 안에는 검색 결과가 없어.
          </div>
        )}

      {coords && !loading && places.length > 0 && (
        <div className="real-place-carousel">
          {places.map((place, index) => {
            const selected =
              todayPlan.some((item) => String(item.id) === String(place.id));

            return (
              <article
                key={place.id}
                className={
                  selected
                    ? "real-place-slide selected"
                    : "real-place-slide"
                }
              >
                <div className="real-place-slide-top">
                  <span className="real-place-index">
                    {selected ? (
                      <Check
                        size={13}
                        strokeWidth={3}
                      />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <strong>
                    {formatDistance(
                      place.distance_m
                    )}
                  </strong>
                </div>

                <div className="real-place-slide-body">
                  <small>
                    {place.category
                      .split(">")
                      .slice(-1)[0]
                      ?.trim()}
                  </small>

                  <h4>{place.place_name}</h4>

                  <p>
                    <MapPin size={12} />
                    {place.address}
                  </p>

                  {place.phone && (
                    <p>
                      <Phone size={12} />
                      {place.phone}
                    </p>
                  )}
                </div>

                <div className="real-place-slide-actions">
                  <button
                    type="button"
                    className={
                      selected
                        ? "place-choice active"
                        : "place-choice"
                    }
                    aria-pressed={selected}
                    onClick={() =>
                      choosePlace(place)
                    }
                  >
                    {selected ? (
                      <>
                        <Check
                          size={13}
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
                      className="place-icon-button"
                      onClick={() => {
                        window.location.href =
                          `tel:${place.phone}`;
                      }}
                      title="전화"
                    >
                      <Phone size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="place-icon-button"
                    onClick={() =>
                      window.open(
                        place.place_url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    title="카카오맵"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
