"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  Navigation,
  Route,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";

import {
  getTodayPlan,
  onTodayPlanChange,
  type TodayPlanPlace,
  moveTodayPlanPlace,
  removeTodayPlanPlace,
} from "@/lib/todayPlan";

import styles from "./course.module.css";

function distanceBetween(
  a: TodayPlanPlace,
  b: TodayPlanPlace
) {
  const lat1 =
    Number(a.latitude) * Math.PI / 180;

  const lat2 =
    Number(b.latitude) * Math.PI / 180;

  const deltaLat =
    (Number(b.latitude) -
      Number(a.latitude)) *
    Math.PI / 180;

  const deltaLng =
    (Number(b.longitude) -
      Number(a.longitude)) *
    Math.PI / 180;

  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    );

  return 6371 * c;
}

export default function CoursePage() {
  const [plan, setPlan] =
    useState<TodayPlanPlace[]>([]);

  useEffect(() => {
    const sync = () => {
      setPlan(getTodayPlan());
    };

    sync();

    return onTodayPlanChange(sync);
  }, []);

  const totalDistance =
    useMemo(() => {
      if (plan.length < 2) {
        return 0;
      }

      let total = 0;

      for (
        let i = 0;
        i < plan.length - 1;
        i++
      ) {
        total += distanceBetween(
          plan[i],
          plan[i + 1]
        );
      }

      return total;
    }, [plan]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="홈으로 돌아가기" className={styles.back}>
          <ArrowLeft size={19} />
        </Link>

        <div>
          <span>OJI COURSE</span>
          <h1>오늘 코스</h1>
        </div>
      </header>

      {plan.length === 0 ? (
        <section className={styles.empty}>
          <Route size={30} />

          <strong>
            아직 오늘 코스가 없어
          </strong>

          <p>
            마음에 드는 장소에서
            ‘여기 갈래’를 눌러봐. 선택한 장소를 여기서 모아볼 수 있어.
          </p>

          <Link href="/nearby" className={styles.findPlaces}>
            장소 찾아서 코스 만들기
          </Link>
        </section>
      ) : (
        <>
          <section className={styles.summary}>
            <div>
              <span>오늘 방문</span>
              <strong>{plan.length}곳</strong>
            </div>

            <div>
              <span>장소 간 직선거리</span>

              <strong>
                {totalDistance < 1
                  ? `${Math.round(
                      totalDistance * 1000
                    )}m`
                  : `${totalDistance.toFixed(1)}km`}
              </strong>
            </div>
          </section>
          <p className={styles.hint}>방문할 순서대로 정리해봐. 실제 이동 거리는 지도에서 확인할 수 있어.</p>

          <section className={styles.course}>
            {plan.map(
              (place, index) => (
                <div
                  className={styles.step}
                  key={`${place.id}-${index}`}
                >
                  <div className={styles.timeline}>
                    <div className={styles.number}>
                      {index + 1}
                    </div>

                    {index < plan.length - 1 && (
                      <div className={styles.line} />
                    )}
                  </div>

                  <article className={styles.card}>
                    <small>
                      {index + 1}차
                    </small>

                    <h2>
                      {place.place_name}
                    </h2>

                    <p>
                      <MapPin size={13} />
                      {place.address}
                    </p>
                    <div className={styles.editActions}>
                      <button type="button" disabled={index === 0} aria-label={`${place.place_name} 앞으로 이동`}
                        onClick={() => setPlan(moveTodayPlanPlace(index, "up"))}><ArrowUp size={16} />앞으로</button>
                      <button type="button" disabled={index === plan.length - 1} aria-label={`${place.place_name} 뒤로 이동`}
                        onClick={() => setPlan(moveTodayPlanPlace(index, "down"))}><ArrowDown size={16} />뒤로</button>
                      <button type="button" aria-label={`${place.place_name} 코스에서 삭제`}
                        onClick={() => setPlan(removeTodayPlanPlace(place.id))}><Trash2 size={16} />삭제</button>
                    </div>

                    {place.place_url && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            place.place_url,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <Navigation size={14} />
                        지도에서 보기
                      </button>
                    )}
                  </article>
                </div>
              )
            )}
          </section>
        </>
      )}
    </main>
  );
}
