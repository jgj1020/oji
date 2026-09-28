"use client";

import RecommendationFit from "@/components/RecommendationFit";

import WeatherSmartBar from "@/components/WeatherSmartBar";

import RealPlaceSuggestions from "@/components/RealPlaceSuggestions";

import ActivityIcon from "@/components/ActivityIcon";

import { useEffect, useState } from "react";
import {
  Gamepad2,
  Utensils,
  Coffee,
  Palette,
  Dumbbell,
  Clapperboard,
  Users,
  Wallet,
  Clock3,
  Sparkles,
  House,
  Compass,
  Heart,
  UserRound,
  ArrowRight,
  MapPin,
  RotateCcw,
  Share2,
  Shuffle,
  History,
  Trash2,
  TreePine,
  Bike,
  Mountain,
  Footprints,
  Music2,
} from "lucide-react";

type Recommendation = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  max_budget: number;
  is_free: boolean;
  environment: string;
  subcategory: string;
  min_people?: number;
  max_people?: number;
  min_hours?: number;
  mood?: string;
};


type NearbyPlace = {
  id: number;
  place_name: string;
  address: string;
  latitude: number;
  longitude: number;
  activity_id: number;
  activity_name: string;
  emoji: string;
  category: string;
  is_free: boolean;
  environment: string;
  subcategory: string;
  min_people?: number;
  max_people?: number;
  min_hours?: number;
  mood?: string;
  distance_m: number;
  place_type?: string | null;
};
const categories = [
  { name: "놀거리", value: "PLAY", icon: Gamepad2 },
  { name: "먹거리", value: "FOOD", icon: Utensils },
  { name: "카페", value: "CAFE", icon: Coffee },
  { name: "체험", value: "EXPERIENCE", icon: Palette },
  { name: "활동", value: "ACTIVE", icon: Dumbbell },
  { name: "볼거리", value: "WATCH", icon: Clapperboard },
];

export default function Home() {
  const [category, setCategory] = useState("PLAY");
  const [people, setPeople] = useState("3~4명");
  const [budget, setBudget] = useState("2만원 이하");
  const [time, setTime] = useState("2~3시간");
  const [mood, setMood] = useState("신나게");

  const [results, setResults] = useState<Recommendation[]>([]);
  const [saved, setSaved] = useState<Recommendation[]>([]);
  const [recent, setRecent] = useState<Recommendation[]>([]);

  const [searched, setSearched] = useState(false);
  const [ignoredRecommendationIds, setIgnoredRecommendationIds] =
    useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [sortMode, setSortMode] = useState<"recommend" | "price">("recommend");

  const [search, setSearch] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [environmentFilter, setEnvironmentFilter] =
    useState<"ALL" | "INDOOR" | "OUTDOOR">("ALL");
  const [visibleCount, setVisibleCount] = useState(5);

  const [locationText, setLocationText] = useState("서울");

  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyTypeFilter, setNearbyTypeFilter] = useState("ALL");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("oji-saved");
      const recentData = localStorage.getItem("oji-recent");

      if (savedData) setSaved(JSON.parse(savedData));
      if (recentData) setRecent(JSON.parse(recentData));
    } catch {
      console.log("저장 데이터를 불러오지 못했습니다.");
    }
  }, []);

  const peopleMap: Record<string, number> = {
    혼자: 1,
    "2명": 2,
    "3~4명": 4,
    "5명+": 5,
  };

  const budgetMap: Record<string, number> = {
    무료: 0,
    "1만원 이하": 10000,
    "2만원 이하": 20000,
    상관없음: 999999,
  };

  const timeMap: Record<string, number> = {
    "1시간": 1,
    "2~3시간": 3,
    반나절: 5,
    하루: 8,
  };

  const moodMap: Record<string, string> = {
    신나게: "EXCITING",
    편하게: "RELAX",
    활동적: "ACTIVE",
    새롭게: "NEW",
  };


  function formatDistance(distance: number) {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }

    return `${(distance / 1000).toFixed(1)}km`;
  }

  async function loadNearbyPlaces(
    latitude: number,
    longitude: number
  ) {
    setNearbyLoading(true);

    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
        category: "ALL",
        limit: "50",
      });

      const response = await fetch(
        `http://localhost:8080/api/places/nearby?${params}`
      );

      if (!response.ok) {
        throw new Error("주변 장소 API 호출 실패");
      }

      const data: NearbyPlace[] = await response.json();

      setNearbyPlaces(data);

      setTimeout(() => {
        document
          .getElementById("nearby-section")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error(error);
      setNearbyPlaces([]);
    } finally {
      setNearbyLoading(false);
    }
  }
  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("현재 브라우저에서는 위치 기능을 사용할 수 없어.");
      return;
    }

    setLocationText("위치 확인 중...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationText("내 위치");

        loadNearbyPlaces(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setLocationText("서울");
        alert("위치 권한을 허용해야 가까운 장소를 찾을 수 있어!");
      }
    );
  }

  function saveRecent(items: Recommendation[]) {
    const merged = [...items, ...recent];

    const unique = merged.filter(
      (item, index, array) =>
        array.findIndex((other) => other.id === item.id) === index
    );

    const next = unique.slice(0, 8);

    setRecent(next);
    localStorage.setItem("oji-recent", JSON.stringify(next));
  }


  useEffect(() => {
    const savedDislikes =
      localStorage.getItem("oji-disliked-activities");

    if (!savedDislikes) return;

    try {
      const parsed = JSON.parse(savedDislikes);

      if (Array.isArray(parsed)) {
        setIgnoredRecommendationIds(parsed);
      }
    } catch {
      localStorage.removeItem("oji-disliked-activities");
    }
  }, []);

  function ignoreRecommendation(id: number) {
    setIgnoredRecommendationIds((prev) => {
      const next = Array.from(
        new Set([...prev, id])
      );

      localStorage.setItem(
        "oji-disliked-activities",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function resetRecommendationPreferences() {
    setIgnoredRecommendationIds([]);

    localStorage.removeItem(
      "oji-disliked-activities"
    );
  }

  function rankRecommendations(
    items: Recommendation[]
  ) {
    const savedIds = new Set(
      saved.map((item) => item.id)
    );

    const savedSubcategories = new Set(
      saved
        .map((item) => item.subcategory)
        .filter(Boolean)
    );

    function getLearningScore(
      item: Recommendation
    ) {
      let score = 0;

      // 정확히 저장한 활동
      if (savedIds.has(item.id)) {
        score += 30;
      }

      // 저장한 활동과 비슷한 종류
      if (
        item.subcategory &&
        savedSubcategories.has(
          item.subcategory
        )
      ) {
        score += 12;
      }

      // 최근 추천에 나온 활동은 잠깐 뒤로
      const recentIndex =
        recent.findIndex(
          (recentItem) =>
            recentItem.id === item.id
        );

      if (recentIndex >= 0) {
        const recentPenalty =
          Math.max(
            4,
            16 - recentIndex * 2
          );

        score -= recentPenalty;
      } else {
        // 아직 최근에 안 본 활동은 조금 우선
        score += 8;
      }

      // 관심없음은 아래 필터에서도 제거되지만
      // 혹시 모를 경우 순위에서도 크게 낮춤
      if (
        ignoredRecommendationIds.includes(
          item.id
        )
      ) {
        score -= 1000;
      }

      return score;
    }

    return [...items].sort(
      (a, b) =>
        getLearningScore(b) -
        getLearningScore(a)
    );
  }

  function changeRecommendationCategory(
    nextCategory: string
  ) {
    setCategory(nextCategory);

    // 이전 추천 화면의 필터가 새 카테고리를 막지 않도록 초기화
    setSearch("");
    setFreeOnly(false);
    setEnvironmentFilter("ALL");
    setVisibleCount(5);

    // 이미 한 번 추천을 받은 상태라면
    // 페이지 이동 없이 새 카테고리를 즉시 다시 조회
    if (searched) {
      loadRecommendations(
        false,
        nextCategory
      );
    }
  }
  async function loadRecommendations(
    random = false,
    categoryOverride?: string
  ) {
    setLoading(true);
    setSearched(true);

    const targetCategory =
      categoryOverride ?? category;

    try {
      /*
       * 1차:
       * 사용자가 선택한 모든 조건으로 정확하게 추천
       */
      const params = new URLSearchParams({
        category: targetCategory,
        people: String(peopleMap[people]),
        budget: String(budgetMap[budget]),
        hours: String(timeMap[time]),
        mood: moodMap[mood],
      });

      const response = await fetch(
        `http://localhost:8080/api/recommendations?${params}`
      );

      if (!response.ok) {
        throw new Error("추천 API 호출 실패");
      }

      let data: Recommendation[] =
        await response.json();

      /*
       * 2차 fallback:
       * 조건이 너무 빡세서 0개가 나오면
       * 카테고리는 절대 바꾸지 않고
       * 해당 카테고리의 활동 전체에서 다시 가져옴.
       */
      if (data.length === 0) {
        console.log(
          `[OJI] ${targetCategory} 정확 조건 결과 0개 → 카테고리 fallback 실행`
        );

        const fallbackParams =
          new URLSearchParams({
            category: targetCategory,
          });

        const fallbackResponse = await fetch(
          `http://localhost:8080/api/activities?${fallbackParams}`
        );

        if (fallbackResponse.ok) {
          const fallbackData: Recommendation[] =
            await fallbackResponse.json();

          data = fallbackData;
        }
      }

      if (random) {
        data = [...data].sort(
          () => Math.random() - 0.5
        );
      }

      const rankedData =
        rankRecommendations(data);

      setResults(rankedData);
      setVisibleCount(5);
      setSortMode("recommend");

      if (rankedData.length > 0) {
        saveRecent(
          rankedData.slice(0, 3)
        );
      }

      setTimeout(() => {
        document
          .getElementById("recommendations")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error(error);

      /*
       * API 자체가 실패한 경우에만 빈 결과 처리.
       * 단순히 조건에 맞는 추천이 0개인 경우는
       * 위 fallback에서 처리됨.
       */
      setResults([]);
    } finally {
      setLoading(false);
    }
  }
function shuffleResults() {
    setResults((prev) => [...prev].sort(() => Math.random() - 0.5));
    setSortMode("recommend");
  }

  function resetConditions() {
    setCategory("PLAY");
    setPeople("3~4명");
    setBudget("2만원 이하");
    setTime("2~3시간");
    setMood("신나게");
    setResults([]);
    setSearched(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleSave(item: Recommendation) {
    const exists = saved.some((savedItem) => savedItem.id === item.id);

    let next: Recommendation[];

    if (exists) {
      next = saved.filter((savedItem) => savedItem.id !== item.id);
    } else {
      next = [item, ...saved];
    }

    setSaved(next);
    localStorage.setItem("oji-saved", JSON.stringify(next));
  }

  async function shareRecommendation(item: Recommendation) {
    const text =
      `✨ OJI 오늘의 추천\n\n` +
      `${item.name}\n` +
      `${item.description}\n` +
      `예산: 최대 ${item.max_budget.toLocaleString()}원`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "OJI 오늘의 추천",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("추천 내용이 복사됐어!");
      }
    } catch {
      console.log("공유가 취소되었습니다.");
    }
  }

  function openMap(item: Recommendation) {
    window.open(
      `https://map.naver.com/p/search/${encodeURIComponent(item.name)}`,
      "_blank"
    );
  }

  const filteredResults = results.filter((item) => {
    if (ignoredRecommendationIds.includes(item.id)) {
      return false;
    }
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      keyword === "" ||
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.subcategory?.toLowerCase().includes(keyword);

    const matchesFree = !freeOnly || item.is_free === true;

    const matchesEnvironment =
      environmentFilter === "ALL" ||
      item.environment === environmentFilter;

    return matchesSearch && matchesFree && matchesEnvironment;
  });

  const displayedResults =
    sortMode === "price"
      ? [...filteredResults].sort(
          (a, b) => a.max_budget - b.max_budget
        )
      : filteredResults;

  const visibleResults = displayedResults.slice(0, visibleCount);

  return (
    <main className="app-bg">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="mobile-shell">
        <header className="header">
          <div>
            <div className="logo">OJI</div>
            <span className="logo-sub">오늘 뭐 하지?</span>
          </div>

          <button className="location" onClick={getCurrentLocation}>
            <MapPin size={16} />
            {locationText}
          </button>
        </header>
      <button
        type="button"
        className="home-nearby-entry"
        onClick={() => {
          window.location.href = "/nearby";
        }}
      >
        <span className="home-nearby-entry-icon">
          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>

        <span className="home-nearby-entry-text">
          <strong>내 주변 장소 찾기</strong>
          <small>
            카페 · 노래방 · 볼링장 등 직접 검색
          </small>
        </span>

        <span className="home-nearby-entry-arrow">
          ›
        </span>
      </button>

        <WeatherSmartBar
          coords={coords}
          onApply={setEnvironmentFilter}
          onRequestLocation={getCurrentLocation}
        />


        <section className="hero">
          <div className="hero-badge">
            <Sparkles size={14} />
            OJI PICK
          </div>

          <h1>
            오늘 하루
            <br />
            <span>뭐 하고 놀까?</span>
          </h1>

          <p>
            조건만 골라봐.
            <br />
            지금 하기 좋은 걸 OJI가 찾아줄게.
          </p>

          <div className="hero-orb">
            <div className="hero-orb-inner">
              <Sparkles size={33} />
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <div>
              <span className="section-kicker">CATEGORY</span>
              <h2>뭐 하고 싶어?</h2>
            </div>

            <button className="tiny-reset" onClick={resetConditions}>
              <RotateCcw size={13} />
              초기화
            </button>
          </div>

          <div className="category-grid">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = category === item.value;

              return (
                <button
                  key={item.value}
                  className={`category-item ${active ? "selected" : ""}`}
                  onClick={() => changeRecommendationCategory(item.value)}
                >
                  <div className="category-icon">
                    <Icon size={23} strokeWidth={2.2} />
                  </div>

                  <span>{item.name}</span>

                  {active && <div className="selection-dot" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <div>
              <span className="section-kicker">TODAY</span>
              <h2>오늘의 조건</h2>
            </div>
          </div>

          <div className="condition-grid">
            <ConditionCard
              icon={<Users size={19} />}
              title="인원"
              value={people}
              values={["혼자", "2명", "3~4명", "5명+"]}
              onChange={setPeople}
            />

            <ConditionCard
              icon={<Wallet size={19} />}
              title="예산"
              value={budget}
              values={["무료", "1만원 이하", "2만원 이하", "상관없음"]}
              onChange={setBudget}
            />

            <ConditionCard
              icon={<Clock3 size={19} />}
              title="시간"
              value={time}
              values={["1시간", "2~3시간", "반나절", "하루"]}
              onChange={setTime}
            />

            <ConditionCard
              icon={<Sparkles size={19} />}
              title="분위기"
              value={mood}
              values={["신나게", "편하게", "활동적", "새롭게"]}
              onChange={setMood}
            />
          </div>
        </section>

        <div className="action-grid">
          <button
            className="random-button"
            onClick={shuffleResults}
            disabled={loading}
          >
            <Shuffle size={18} />
            아무거나 골라줘
          </button>

          <button className="reset-button" onClick={resetConditions}>
            <RotateCcw size={17} />
            조건 초기화
          </button>
        </div>

        <button
          className="main-cta"
          onClick={() => loadRecommendations(false)}
          disabled={loading}
        >
          <div className="cta-icon">
            <Sparkles size={20} />
          </div>

          <div className="cta-text">
            <small>READY?</small>
            <strong>
              {loading ? "OJI가 찾는 중..." : "오늘 할 거 찾아보기"}
            </strong>
          </div>

          <div className="cta-arrow">
            <ArrowRight size={21} />
          </div>
        </button>


        <section
          id="nearby-section"
          className="nearby-section"
        >
          <div className="nearby-head">
            <div>
              <span className="section-kicker">
                NEARBY
              </span>

              <h2>내 주변에서 바로 갈 곳</h2>

              <p>
                현재 위치에서 가까운 순으로 보여줄게.
              </p>
            </div>

            <button onClick={getCurrentLocation}>
              <MapPin size={16} />

              {nearbyLoading
                ? "찾는 중"
                : "내 주변"}
            </button>
          </div>

          {nearbyPlaces.length > 0 && (
            <div className="nearby-list">
              <div className="nearby-filter-row">
                {[
                  { key: "ALL", label: "전체" },
                  { key: "PARK", label: "공원" },
                  { key: "SOCCER", label: "축구" },
                  { key: "BASKETBALL", label: "농구" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    className={
                      nearbyTypeFilter === filter.key
                        ? "nearby-filter active"
                        : "nearby-filter"
                    }
                    onClick={() => setNearbyTypeFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {nearbyPlaces
                .filter(
                  (place) =>
                    nearbyTypeFilter === "ALL" ||
                    place.place_type === nearbyTypeFilter
                )
                .slice(0, 5)
                .map((place, index) => (
                <article
                  className="nearby-card"
                  key={place.id}
                >
                  <div className="nearby-rank">
                    {index + 1}
                  </div>

                  <div className="nearby-emoji">
  <ActivityIcon
    category={place.category}
    subcategory={place.subcategory}
    name={place.activity_name}
    size={25}
  />
</div>

                  <div className="nearby-info">
                    <div className="nearby-title-row">
                      <div>
                        <small>
                          {place.activity_name}
                        </small>

                        <h3>
                          {place.place_name}
                        </h3>
                      </div>

                      <strong>
                        {formatDistance(
                          Number(place.distance_m)
                        )}
                      </strong>
                    </div>

                    <p>{place.address}</p>

                    <div className="nearby-tags">
                      <span>
                        {place.is_free
                          ? "무료"
                          : "유료"}
                      </span>

                      <span>
                        {place.environment === "INDOOR"
                          ? "실내"
                          : "야외"}
                      </span>

                      <span>
                        {place.subcategory}
                      </span>
                    </div>

                    <button
                      className="nearby-map-button"
                      onClick={() =>
                        window.open(
                          `https://map.naver.com/p/search/${encodeURIComponent(
                            place.place_name
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      <MapPin size={14} />
                      지도에서 보기
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!nearbyLoading &&
            nearbyPlaces.length === 0 && (
              <button
                className="nearby-empty"
                onClick={getCurrentLocation}
              >
                <MapPin size={22} />

                <div>
                  <strong>
                    내 주변 장소 찾아보기
                  </strong>

                  <span>
                    위치를 허용하면 가까운 순으로 보여줘.
                  </span>
                </div>

                <ArrowRight size={18} />
              </button>
            )}
        </section>

        <section id="recommendations" className="recommendations">
          {searched && !loading && results.length > 0 && (
            <>
              <div className="result-header">
                <span className="section-kicker">RESULT</span>
                <h2>{filteredResults.length}개 찾았어.</h2>

                {(saved.length > 0 || recent.length > 0 || ignoredRecommendationIds.length > 0) && (
                  <div className="preference-learning-bar">
                    <div>
                      <strong>취향 학습 중</strong>
                      <span>
                        저장 {saved.length} · 최근 {recent.length} · 관심 없음 {ignoredRecommendationIds.length} 반영
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={resetRecommendationPreferences}
                    >
                      초기화
                    </button>
                  </div>
                )}
                <p>원하는 방식으로 정렬해서 골라봐.</p>
              </div>

              <div className="result-tools">
                <div className="result-search">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setVisibleCount(5);
                    }}
                    placeholder="축구, 볼링, 카페 검색..."
                  />
                </div>

                <div className="quick-filters">
                  <button
                    className={freeOnly ? "active" : ""}
                    onClick={() => {
                      setFreeOnly(!freeOnly);
                      setVisibleCount(5);
                    }}
                  >
                    💸 무료만
                  </button>

                  <button
                    className={environmentFilter === "INDOOR" ? "active" : ""}
                    onClick={() => {
                      setEnvironmentFilter(
                        environmentFilter === "INDOOR"
                          ? "ALL"
                          : "INDOOR"
                      );
                      setVisibleCount(5);
                    }}
                  >
                    🏠 실내
                  </button>

                  <button
                    className={environmentFilter === "OUTDOOR" ? "active" : ""}
                    onClick={() => {
                      setEnvironmentFilter(
                        environmentFilter === "OUTDOOR"
                          ? "ALL"
                          : "OUTDOOR"
                      );
                      setVisibleCount(5);
                    }}
                  >
                    ☀️ 야외
                  </button>
                </div>
              </div>
              <div className="sort-tabs">
                <button
                  className={sortMode === "recommend" ? "active" : ""}
                  onClick={() => setSortMode("recommend")}
                >
                  🔥 추천순
                </button>

                <button
                  className={sortMode === "price" ? "active" : ""}
                  onClick={() => setSortMode("price")}
                >
                  💸 가격순
                </button>

                <button onClick={shuffleResults}>
                  <Shuffle size={14} />
                  섞기
                </button>
              </div>

              <RealPlaceSuggestions
                activityName={visibleResults[0]?.name}
                coords={coords}
                onRequestLocation={getCurrentLocation}
              />

              {visibleResults.map((item, index) =>
                index === 0 ? (
                  <article className="best-card" key={item.id}>
                    <div className="best-top">
                      <div className="best-label">
                        <Sparkles size={14} />
                        BEST PICK
                      </div>

                      <button
                        className={`heart-button ${
                          saved.some((savedItem) => savedItem.id === item.id)
                            ? "saved"
                            : ""
                        }`}
                        onClick={() => toggleSave(item)}
                      >
                        <Heart
                          size={19}
                          fill={
                            saved.some(
                              (savedItem) => savedItem.id === item.id
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <div className="best-visual">
                      <ActivityIcon name={item.name} subcategory={item.subcategory} size={52} />
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    <div className="result-info-row">
                      <span className={item.is_free ? "free-badge" : "price-pill"}>
                        {item.is_free
                          ? "무료"
                          : `최대 ${item.max_budget.toLocaleString()}원`}
                      </span>

                      <span className="environment-badge">
                        {item.environment === "INDOOR" ? "🏠 실내" : "☀️ 야외"}
                      </span>

                      <span className="subcategory-badge">
                        {item.subcategory}
                      </span>
                    </div>

                    <RecommendationFit
                      item={item}
                      people={people}
                      budget={budget}
                      hours={time}
                      mood={mood}
                      weatherEnvironment={environmentFilter}
                    />

                    <div className="best-actions">
                      <button
                        type="button"
                        className="not-interested-button"
                        onClick={() =>
                          ignoreRecommendation(item.id)
                        }
                      >
                        관심 없음
                      </button>
                      <button
                        className="place-button"
                        onClick={() => openMap(item)}
                      >
                        <MapPin size={17} />
                        근처 찾기
                      </button>

                      <button
                        className="share-button"
                        onClick={() => shareRecommendation(item)}
                      >
                        <Share2 size={17} />
                        공유
                      </button>
                    </div>
                  </article>
                ) : (
                  <article className="sub-result" key={item.id}>
                    <div className="sub-result-icon">
  <ActivityIcon
    name={item.name}
    subcategory={item.subcategory}
    size={25}
  />
</div>

                    <div
                      className="sub-result-content"
                      onClick={() => openMap(item)}
                    >
                      <small>추천 {index + 1}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>

                      <span className="mini-price">
                        {item.is_free
                          ? "무료"
                          : `최대 ${item.max_budget.toLocaleString()}원`}
                        {" · "}
                        {item.environment === "INDOOR" ? "실내" : "야외"}
                      </span>
                    </div>

                    <button
                      className={`mini-heart ${
                        saved.some((savedItem) => savedItem.id === item.id)
                          ? "saved"
                          : ""
                      }`}
                      onClick={() => toggleSave(item)}
                    >
                      <Heart
                        size={17}
                        fill={
                          saved.some((savedItem) => savedItem.id === item.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </article>
                )
              )}


              {displayedResults.length > visibleCount && (
                <button
                  className="more-button"
                  onClick={() =>
                    setVisibleCount((prev) => prev + 5)
                  }
                >
                  추천 더 보기
                  <span>
                    {Math.min(
                      displayedResults.length - visibleCount,
                      5
                    )}개 더
                  </span>
                </button>
              )}
              <button
                className="retry-button"
                onClick={shuffleResults}
              >
                <Shuffle size={16} />
                다른 추천 보기
              </button>
            </>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="empty-result">
              <Sparkles size={28} />
              <h3>딱 맞는 결과가 없네</h3>
              <p>조건을 조금 바꿔서 다시 찾아봐!</p>
            </div>
          )}
        </section>

        {recent.length > 0 && (
          <section className="extra-section" id="recent-section">
            <div className="extra-header">
              <div>
                <span className="section-kicker">HISTORY</span>
                <h2>
                  <History size={19} />
                  최근 추천
                </h2>
              </div>

              <button
                onClick={() => {
                  setRecent([]);
                  localStorage.removeItem("oji-recent");
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="horizontal-list">
              {recent.map((item) => (
                <button
                  className="history-card"
                  key={item.id}
                  onClick={() => openMap(item)}
                >
                  <ActivityIcon name={item.name} subcategory={item.subcategory} size={52} />
                  <strong>{item.name}</strong>
                  <small>최대 {item.max_budget.toLocaleString()}원</small>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="extra-section" id="saved-section">
          <div className="extra-header">
            <div>
              <span className="section-kicker">SAVED</span>
              <h2>
                <Heart size={19} />
                저장한 추천
              </h2>
            </div>

            <span>{saved.length}개</span>
          </div>

          {saved.length === 0 ? (
            <div className="saved-empty">
              <Heart size={24} />
              <p>마음에 드는 추천을 저장해봐.</p>
            </div>
          ) : (
            <div className="saved-list">
              {saved.map((item) => (
                <div className="saved-item" key={item.id}>
                  <button
                    className="saved-main"
                    onClick={() => openMap(item)}
                  >
                    <ActivityIcon name={item.name} subcategory={item.subcategory} size={52} />

                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </div>
                  </button>

                  <button
                    className="saved-delete"
                    onClick={() => toggleSave(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <nav className="bottom-nav">
  <button
    className="nav-active"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <House size={22} />
    <span>홈</span>
  </button>

  <button onClick={() => (window.location.href = "/explore")}>
    <Compass size={22} />
    <span>탐색</span>
  </button>

  <button onClick={() => (window.location.href = "/saved")}>
    <Heart size={22} />
    <span>저장</span>
  </button>

  <button onClick={() => (window.location.href = "/my")}>
    <UserRound size={22} />
    <span>MY</span>
  </button>
</nav>
      </section>
    </main>
  );
}


function PlaceIcon({
  category,
  subcategory,
}: {
  category: string;
  subcategory: string;
  min_people?: number;
  max_people?: number;
  min_hours?: number;
  mood?: string;
}) {
  if (subcategory === "산책") {
    return <Footprints size={25} />;
  }

  if (subcategory === "자전거") {
    return <Bike size={25} />;
  }

  if (subcategory === "등산") {
    return <Mountain size={25} />;
  }

  if (
    subcategory === "운동" ||
    subcategory === "축구" ||
    subcategory === "농구" ||
    subcategory === "야구"
  ) {
    return <Dumbbell size={25} />;
  }

  if (category === "PLAY") {
    return <Gamepad2 size={25} />;
  }

  if (category === "FOOD") {
    return <Utensils size={25} />;
  }

  if (category === "CAFE") {
    return <Coffee size={25} />;
  }

  if (category === "EXPERIENCE") {
    return <Palette size={25} />;
  }

  if (category === "WATCH") {
    return <Clapperboard size={25} />;
  }

  if (category === "ACTIVE") {
    return <TreePine size={25} />;
  }

  return <Sparkles size={25} />;
}
function ConditionCard({
  icon,
  title,
  value,
  values,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  function nextValue() {
    const current = values.indexOf(value);
    const next = (current + 1) % values.length;
    onChange(values[next]);
  }

  return (
    <button className="condition-card" onClick={nextValue}>
      <div className="condition-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <ArrowRight className="condition-arrow" size={16} />
    </button>
  );
}