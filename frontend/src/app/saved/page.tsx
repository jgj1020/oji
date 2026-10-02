"use client";

import ActivityIcon from "@/components/ActivityIcon";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import {
  Heart,
  Trash2,
  MapPin,
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
  category?: string;
};

export default function SavedPage() {
  const router = useRouter();
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
    router.push(`/nearby?query=${encodeURIComponent(item.name)}`);
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
          <Heart className="saved-count-icon" size={28} strokeWidth={1.7} aria-hidden="true" />
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
                  <ActivityIcon
                    category={item.category}
                    subcategory={item.subcategory}
                    name={item.name}
                    size={27}
                  />
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
                  aria-label={`${item.name} 저장 취소`}
                  onClick={() => remove(item)}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
