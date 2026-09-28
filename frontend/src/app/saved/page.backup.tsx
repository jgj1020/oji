"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Trash2,
  MapPin,
  House,
  Compass,
  UserRound,
} from "lucide-react";

type Activity = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  max_budget: number;
  is_free?: boolean;
  environment?: string;
  subcategory?: string;
};

export default function SavedPage() {
  const [saved, setSaved] = useState<Activity[]>([]);

  useEffect(() => {
    try {
      setSaved(
        JSON.parse(localStorage.getItem("oji-saved") || "[]")
      );
    } catch {
      setSaved([]);
    }
  }, []);

  function remove(item: Activity) {
    const next = saved.filter((savedItem) => savedItem.id !== item.id);

    setSaved(next);
    localStorage.setItem("oji-saved", JSON.stringify(next));
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
            <span className="section-kicker">SAVED</span>
            <h1>찜해둔 곳.</h1>
            <p>마음에 들었던 추천을 다시 확인해봐.</p>
          </div>

          <div className="page-icon">
            <Heart size={24} />
          </div>
        </header>

        <div className="saved-page-count">
          <strong>{saved.length}</strong>
          <span>개의 추천을 저장했어</span>
        </div>

        {saved.length === 0 ? (
          <div className="tab-empty">
            <Heart size={28} />

            <h3>아직 저장한 추천이 없어</h3>

            <p>탐색에서 마음에 드는 걸 저장해봐.</p>

            <button
              onClick={() => (window.location.href = "/explore")}
            >
              탐색하러 가기
            </button>
          </div>
        ) : (
          <div className="saved-page-list">
            {saved.map((item) => (
              <article className="saved-page-card" key={item.id}>
                <div className="saved-page-emoji">
                  {item.emoji}
                </div>

                <div className="saved-page-info">
                  <small>{item.subcategory || "OJI PICK"}</small>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <button onClick={() => openMap(item)}>
                    <MapPin size={14} />
                    근처 찾기
                  </button>
                </div>

                <button
                  className="saved-remove"
                  onClick={() => remove(item)}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}

        <nav className="bottom-nav">
          <button onClick={() => (window.location.href = "/")}>
            <House size={22} />
            <span>홈</span>
          </button>

          <button onClick={() => (window.location.href = "/explore")}>
            <Compass size={22} />
            <span>탐색</span>
          </button>

          <button className="nav-active">
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