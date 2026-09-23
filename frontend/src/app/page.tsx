"use client";

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
} from "lucide-react";

type Recommendation = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  max_budget: number;
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
  const [loading, setLoading] = useState(false);

  const [sortMode, setSortMode] = useState<"recommend" | "price">("recommend");

  const [locationText, setLocationText] = useState("서울");
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

  async function loadRecommendations(random = false) {
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        category,
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

      let data: Recommendation[] = await response.json();

      if (random) {
        data = [...data].sort(() => Math.random() - 0.5);
      }

      setResults(data);
      setSortMode("recommend");

      if (data.length > 0) {
        saveRecent(data.slice(0, 3));
      }

      setTimeout(() => {
        document.getElementById("recommendations")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error(error);
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

  const displayedResults =
    sortMode === "price"
      ? [...results].sort((a, b) => a.max_budget - b.max_budget)
      : results;

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

        <section className="hero">
          <div className="hero-badge">
            <Sparkles size={14} />
            OJI PICK
          </div>

          <h1>
            오늘 하루,
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
                  onClick={() => setCategory(item.value)}
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
            onClick={() => loadRecommendations(true)}
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

        <section id="recommendations" className="recommendations">
          {searched && !loading && results.length > 0 && (
            <>
              <div className="result-header">
                <span className="section-kicker">RESULT</span>
                <h2>{results.length}개 찾았어.</h2>
                <p>원하는 방식으로 정렬해서 골라봐.</p>
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

              {displayedResults.map((item, index) =>
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
                      <span>{item.emoji}</span>
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    <div className="price-pill">
                      최대 {item.max_budget.toLocaleString()}원
                    </div>

                    <div className="best-actions">
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
                    <div className="sub-result-icon">{item.emoji}</div>

                    <div
                      className="sub-result-content"
                      onClick={() => openMap(item)}
                    >
                      <small>추천 {index + 1}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>

                      <span className="mini-price">
                        최대 {item.max_budget.toLocaleString()}원
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

              <button
                className="retry-button"
                onClick={() => loadRecommendations(true)}
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
                  <span>{item.emoji}</span>
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
                    <span>{item.emoji}</span>

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
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <House size={22} />
            <span>홈</span>
          </button>

          <button
            onClick={() =>
              document
                .getElementById("recommendations")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Compass size={22} />
            <span>탐색</span>
          </button>

          <button
            onClick={() =>
              document
                .getElementById("saved-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Heart size={22} />
            <span>저장 {saved.length > 0 ? saved.length : ""}</span>
          </button>

          <button
            onClick={() => alert("MY 기능은 다음에 만들자!")}
          >
            <UserRound size={22} />
            <span>MY</span>
          </button>
        </nav>
      </section>
    </main>
  );
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