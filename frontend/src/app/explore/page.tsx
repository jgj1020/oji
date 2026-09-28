"use client";

import ActivityIcon from "@/components/ActivityIcon";

import { useEffect, useState } from "react";
import {
  Search,
  Heart,
  MapPin,
  House,
  Compass,
  UserRound,
  Sparkles,
} from "lucide-react";

type Activity = {
  id: number;
  category: string;
  name: string;
  emoji: string;
  description: string;
  max_budget: number;
  is_free: boolean;
  environment: string;
  subcategory: string;
};

const categories = [
  ["ALL", "전체"],
  ["PLAY", "놀거리"],
  ["FOOD", "먹거리"],
  ["CAFE", "카페"],
  ["EXPERIENCE", "체험"],
  ["ACTIVE", "활동"],
  ["WATCH", "볼거리"],
];

export default function ExplorePage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [environment, setEnvironment] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("oji-saved") || "[]"
      ) as Activity[];

      setSavedIds(saved.map((item) => item.id));
    } catch {
      setSavedIds([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          category,
          q: search,
          freeOnly: String(freeOnly),
          environment,
        });

        const response = await fetch(
          `/backend-api/activities?${params}`
        );

        const data = await response.json();
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [category, search, freeOnly, environment]);

  function toggleSave(item: Activity) {
    const current = JSON.parse(
      localStorage.getItem("oji-saved") || "[]"
    ) as Activity[];

    const exists = current.some((saved) => saved.id === item.id);

    const next = exists
      ? current.filter((saved) => saved.id !== item.id)
      : [item, ...current];

    localStorage.setItem("oji-saved", JSON.stringify(next));
    setSavedIds(next.map((saved) => saved.id));
  }

  function openMap(item: Activity) {
    window.open(
      `https://map.naver.com/p/search/${encodeURIComponent(item.name)}`,
      "_blank"
    );
  }

  return (
    <main className="app-bg">
      <section className="mobile-shell tab-page">
        <header className="page-header">
          <div>
            <span className="section-kicker">EXPLORE</span>
            <h1>뭐 할지 찾아보자.</h1>
            <p>OJI에 있는 활동을 직접 둘러볼 수 있어.</p>
          </div>

          <div className="page-icon">
            <Compass size={24} />
          </div>
        </header>

        <div className="explore-search">
          <Search size={19} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="축구, 볼링, 카페, 전시 검색..."
          />
        </div>

        <div className="category-scroll">
          {categories.map(([value, label]) => (
            <button
              key={value}
              className={category === value ? "active" : ""}
              onClick={() => setCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="explore-filter-row">
          <button
            className={freeOnly ? "active" : ""}
            onClick={() => setFreeOnly(!freeOnly)}
          >
            무료만
          </button>

          <button
            className={environment === "INDOOR" ? "active" : ""}
            onClick={() =>
              setEnvironment(
                environment === "INDOOR" ? "ALL" : "INDOOR"
              )
            }
          >
            실내
          </button>

          <button
            className={environment === "OUTDOOR" ? "active" : ""}
            onClick={() =>
              setEnvironment(
                environment === "OUTDOOR" ? "ALL" : "OUTDOOR"
              )
            }
          >
            야외
          </button>
        </div>

        <div className="explore-result-head">
          <div>
            <span className="section-kicker">DISCOVER</span>
            <h2>
              {loading ? "찾는 중..." : `${items.length}개 있어`}
            </h2>
          </div>
        </div>

        <div className="explore-list">
          {items.map((item) => {
            const saved = savedIds.includes(item.id);

            return (
              <article className="explore-card" key={item.id}>
                <div className="explore-card-icon">
                  <ActivityIcon
                    category={item.category}
                    subcategory={item.subcategory}
                    name={item.name}
                    size={28}
                  />
                </div>

                <div className="explore-card-main">
                  <div className="explore-card-top">
                    <span>{item.subcategory}</span>

                    <button
                      className={saved ? "saved" : ""}
                      onClick={() => toggleSave(item)}
                    >
                      <Heart
                        size={18}
                        fill={saved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="explore-tags">
                    <span>
                      {item.is_free
                        ? "무료"
                        : `${item.max_budget.toLocaleString()}원 이하`}
                    </span>

                    <span>
                      {item.environment === "INDOOR"
                        ? "실내"
                        : "야외"}
                    </span>
                  </div>

                  <button
                    className="explore-map"
                    onClick={() => openMap(item)}
                  >
                    <MapPin size={15} />
                    근처에서 찾기
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && items.length === 0 && (
          <div className="tab-empty">
            <Sparkles size={28} />
            <h3>검색 결과가 없어</h3>
            <p>조건을 조금 바꿔봐.</p>
          </div>
        )}

        <nav className="bottom-nav">
          <button onClick={() => (window.location.href = "/")}>
            <House size={22} />
            <span>홈</span>
          </button>

          <button className="nav-active">
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