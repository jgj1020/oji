"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  MapPin,
  Navigation,
  Route,
} from "lucide-react";

import {
  getTodayPlan,
  onTodayPlanChange,
  type TodayPlanPlace,
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
        <button
          type="button"
          onClick={() => history.back()}
        >
          <ArrowLeft size={19} />
        </button>

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
            ‘오늘 코스에 추가’를 눌러봐.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            추천 받으러 가기
          </button>
        </section>
      ) : (
        <>
          <section className={styles.summary}>
            <div>
              <span>오늘 방문</span>
              <strong>{plan.length}곳</strong>
            </div>

            <div>
              <span>코스 거리</span>

              <strong>
                {totalDistance < 1
                  ? `${Math.round(
                      totalDistance * 1000
                    )}m`
                  : `${totalDistance.toFixed(1)}km`}
              </strong>
            </div>
          </section>

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