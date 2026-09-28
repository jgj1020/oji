"use client";

import { useEffect, useState } from "react";
import {
  House,
  Compass,
  Heart,
  UserRound,
  MapPin,
  History,
  Trash2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function MyPage() {
  const [savedCount, setSavedCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);
  const [locationText, setLocationText] = useState("위치 설정 안 됨");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("oji-saved") || "[]"
      );

      const recent = JSON.parse(
        localStorage.getItem("oji-recent") || "[]"
      );

      setSavedCount(saved.length);
      setRecentCount(recent.length);

      if (localStorage.getItem("oji-location")) {
        setLocationText("내 위치 사용 중");
      }
    } catch {}
  }, []);

  function getLocation() {
    if (!navigator.geolocation) {
      alert("위치 기능을 사용할 수 없어.");
      return;
    }

    setLocationText("위치 확인 중...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem(
          "oji-location",
          JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        );

        setLocationText("내 위치 사용 중");
      },
      () => {
        setLocationText("위치 설정 안 됨");
        alert("위치 권한을 허용해줘.");
      }
    );
  }

  function clearRecent() {
    if (!confirm("최근 추천 기록을 지울까?")) return;

    localStorage.removeItem("oji-recent");
    setRecentCount(0);
  }

  function clearSaved() {
    if (!confirm("저장한 추천을 전부 지울까?")) return;

    localStorage.removeItem("oji-saved");
    setSavedCount(0);
  }

  return (
    <main className="app-bg">
      <section className="mobile-shell tab-page">
        <header className="page-header">
          <div>
            <span className="section-kicker">MY OJI</span>
            <h1>나의 OJI.</h1>
            <p>내 추천 기록과 설정을 관리해.</p>
          </div>

          <div className="page-icon">
            <UserRound size={24} />
          </div>
        </header>

        <section className="my-profile">
          <div className="my-avatar">
            <Sparkles size={27} />
          </div>

          <div>
            <small>OJI USER</small>
            <h2>오늘도 뭐 할지 찾아볼까?</h2>
          </div>
        </section>

        <div className="my-stat-grid">
          <button onClick={() => (window.location.href = "/saved")}>
            <Heart size={20} />
            <strong>{savedCount}</strong>
            <span>저장</span>
          </button>

          <div>
            <History size={20} />
            <strong>{recentCount}</strong>
            <span>최근 추천</span>
          </div>
        </div>

        <section className="my-section">
          <span className="section-kicker">SETTINGS</span>
          <h2>설정</h2>

          <button className="my-menu" onClick={getLocation}>
            <div className="my-menu-icon">
              <MapPin size={18} />
            </div>

            <div>
              <strong>현재 위치</strong>
              <span>{locationText}</span>
            </div>

            <ChevronRight size={18} />
          </button>

          <button className="my-menu" onClick={clearRecent}>
            <div className="my-menu-icon">
              <History size={18} />
            </div>

            <div>
              <strong>최근 추천 초기화</strong>
              <span>최근 본 추천 기록 삭제</span>
            </div>

            <Trash2 size={17} />
          </button>

          <button className="my-menu danger" onClick={clearSaved}>
            <div className="my-menu-icon">
              <Heart size={18} />
            </div>

            <div>
              <strong>저장 목록 비우기</strong>
              <span>저장한 추천 전체 삭제</span>
            </div>

            <Trash2 size={17} />
          </button>
        </section>

        <nav className="bottom-nav">
          <button onClick={() => (window.location.href = "/")}>
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

          <button className="nav-active">
            <UserRound size={22} />
            <span>MY</span>
          </button>
        </nav>
      </section>
    </main>
  );
}