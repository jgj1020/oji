"use client";

import { useEffect, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  Map,
  MapPin,
  Navigation,
  Trash2,
  X,
} from "lucide-react";

import {
  clearTodayPlan,
  getTodayPlan,
  moveTodayPlanPlace,
  onTodayPlanChange,
  removeTodayPlanPlace,
  type TodayPlanPlace,
} from "@/lib/todayPlan";

function formatDistance(
  value?: number
) {
  const distance = Number(value);

  if (!Number.isFinite(distance)) {
    return "";
  }

  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`;
  }

  return `${Math.round(distance)}m`;
}

export default function TodayPlaceCard() {
  const [plan, setPlan] =
    useState<TodayPlanPlace[]>([]);

  useEffect(() => {
    const sync = () => {
      setPlan(getTodayPlan());
    };

    sync();

    return onTodayPlanChange(sync);
  }, []);

  function removePlace(
    id: string | number
  ) {
    setPlan(
      removeTodayPlanPlace(id)
    );
  }

  function movePlace(
    index: number,
    direction: "up" | "down"
  ) {
    setPlan(
      moveTodayPlanPlace(
        index,
        direction
      )
    );
  }

  function clearAll() {
    clearTodayPlan();
    setPlan([]);
  }

  if (plan.length === 0) {
    return (
      <section className="my-today-empty">
        <div className="my-today-empty-icon">
          <MapPin size={19} />
        </div>

        <div>
          <strong>오늘 코스</strong>

          <p>
            마음에 드는 장소를 계속 추가해봐.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-today-place">

      <div className="my-course-head">
        <div>
          <span className="my-today-label">
            TODAY COURSE
          </span>

          <h2>
            오늘 코스 · {plan.length}곳
          </h2>
        </div>

        <button
          type="button"
          className="my-course-clear"
          onClick={clearAll}
        >
          <Trash2 size={13} />
          전체 삭제
        </button>
      </div>

      <div className="my-course-list">

        {plan.map((place, index) => (
          <article
            className="my-course-item"
            key={`${place.id}-${index}`}
          >
            <div className="my-course-order">
              {index + 1}
            </div>

            <div className="my-course-info">
              <small>
                {index + 1}차
              </small>

              <strong>
                {place.place_name}
              </strong>

              <p>
                {formatDistance(
                  place.distance_m
                )}

                {place.address
                  ? ` · ${place.address}`
                  : ""}
              </p>
            </div>

            <div className="my-course-actions">

              <button
                type="button"
                disabled={index === 0}
                onClick={() =>
                  movePlace(index, "up")
                }
                aria-label="위로 이동"
              >
                <ArrowUp size={14} />
              </button>

              <button
                type="button"
                disabled={
                  index === plan.length - 1
                }
                onClick={() =>
                  movePlace(index, "down")
                }
                aria-label="아래로 이동"
              >
                <ArrowDown size={14} />
              </button>

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
                  aria-label="지도 보기"
                >
                  <Navigation size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  removePlace(place.id)
                }
                aria-label="코스에서 삭제"
              >
                <X size={14} />
              </button>

            </div>
          </article>
        ))}

      </div>

      <button
        type="button"
        className="course-overview-button"
        onClick={() => {
          window.location.href = "/course";
        }}
      >
        <Map size={16} />

        전체 코스 보기

        <span>›</span>
      </button>

    </section>
  );
}