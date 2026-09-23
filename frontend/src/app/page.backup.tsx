"use client";

import { useState } from "react";
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
  RotateCcw, Share2,
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
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState("서울");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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

        setLocationText("위치 확인됨");
      },
      () => {
        setLocationText("서울");
        alert("위치 권한을 허용해야 가까운 장소를 찾을 수 있어!");
      }
    );
  }

  async function searchRecommendations() {
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

      const data = await response.json();
      setResults(data);

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
            <span className="section-count">1개 선택</span>
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

        <button
          className="main-cta"
          onClick={searchRecommendations}
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
                <h2>OJI가 골라봤어.</h2>
                <p>지금 조건에 잘 맞는 순서야.</p>
              </div>

              {results.map((item, index) =>
                index === 0 ? (
                  <article className="best-card" key={item.id}>
                    <div className="best-top">
                      <div className="best-label">
                        <Sparkles size={14} />
                        BEST PICK
                      </div>

                      <strong>96%</strong>
                    </div>

                    <div className="best-visual">
                      <span>{item.emoji}</span>
                    </div>

                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    <div className="price-pill">
                      최대 {item.max_budget.toLocaleString()}원
                    </div>

                    <button
                      className="place-button"
                      onClick={() =>
                        window.open(
                          `https://map.naver.com/p/search/${encodeURIComponent(item.name)}`,
                          "_blank"
                        )
                      }
                    >
                      근처에서 찾아보기
                      <ArrowRight size={17} />
                    </button>

                    <button
                      className="place-button"
                      style={{ marginTop: 8 }}
                      onClick={async () => {
                        const text = `✨ OJI 오늘의 추천
${item.name}
${item.description}`;

                        if (navigator.share) {
                          await navigator.share({
                            title: "OJI 오늘의 추천",
                            text,
                          });
                        } else {
                          await navigator.clipboard.writeText(text);
                          alert("추천 내용이 복사됐어!");
                        }
                      }}
                    >
                      친구에게 공유하기
                      <Share2 size={17} />
                    </button>
                  </article>
                ) : (
                  <article className="sub-result" key={item.id}>
                    <div className="sub-result-icon">{item.emoji}</div>

                    <div className="sub-result-content">
                      <small>추천 {index + 1}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>

                    <strong>{96 - index * 5}%</strong>
                  </article>
                )
              )}

              <button className="retry-button" onClick={() => setResults((prev) => [...prev].sort(() => Math.random() - 0.5))}>
                <RotateCcw size={16} />
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

        <nav className="bottom-nav">
          <button className="nav-active">
            <House size={22} />
            <span>홈</span>
          </button>

          <button>
            <Compass size={22} />
            <span>탐색</span>
          </button>

          <button>
            <Heart size={22} />
            <span>저장</span>
          </button>

          <button>
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