"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type Item = {
  id?: number;
  activity_id?: number;
  max_budget: number;
  is_free: boolean;
  environment: string;
  min_people?: number;
  max_people?: number;
  min_hours?: number;
  mood?: string;
};

type Props = {
  item: Item;
  people: number;
  budget: number;
  hours: number;
  mood: string;
  weatherEnvironment: string;
};

function containsActivity(
  raw: string | null,
  activityId: number
) {
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return false;
    }

    return parsed.some((entry) => {
      if (typeof entry === "number") {
        return entry === activityId;
      }

      if (typeof entry === "string") {
        return Number(entry) === activityId;
      }

      if (
        typeof entry === "object" &&
        entry !== null
      ) {
        const id =
          entry.id ??
          entry.activity_id;

        return Number(id) === activityId;
      }

      return false;
    });
  } catch {
    return false;
  }
}

export default function RecommendationFit({
  item,
  people,
  budget,
  hours,
  mood,
  weatherEnvironment,
}: Props) {
  const activityId =
    Number(item.id ?? item.activity_id ?? 0);

  const [isSaved, setIsSaved] =
    useState(false);

  const [isDisliked, setIsDisliked] =
    useState(false);

  useEffect(() => {
    function syncPreference() {
      if (!activityId) return;

      const saved = containsActivity(
        localStorage.getItem("oji-saved"),
        activityId
      );

      const disliked = containsActivity(
        localStorage.getItem(
          "oji-disliked-activities"
        ),
        activityId
      );

      setIsSaved(saved);
      setIsDisliked(disliked);
    }

    syncPreference();

    const interval =
      window.setInterval(
        syncPreference,
        400
      );

    window.addEventListener(
      "storage",
      syncPreference
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        "storage",
        syncPreference
      );
    };
  }, [activityId]);

  let score = 0;
  const reasons: string[] = [];

  const peopleFit =
    item.min_people === undefined ||
    item.max_people === undefined ||
    (
      people >= item.min_people &&
      people <= item.max_people
    );

  if (peopleFit) {
    score += 20;
    reasons.push(
      `${people}명이서 하기 좋아`
    );
  }

  const budgetFit =
    item.is_free ||
    Number(item.max_budget) <= budget;

  if (budgetFit) {
    score += 20;

    reasons.push(
      item.is_free
        ? "비용 부담이 적어"
        : "예산 안에 들어와"
    );
  }

  const timeFit =
    item.min_hours === undefined ||
    Number(item.min_hours) <= hours;

  if (timeFit) {
    score += 15;
    reasons.push(
      `${hours}시간 안에 가능해`
    );
  }

  if (
    !item.mood ||
    item.mood === mood
  ) {
    score += 20;

    reasons.push(
      "원하는 분위기와 잘 맞아"
    );
  } else {
    score += 8;
  }

  if (
    weatherEnvironment === "ALL" ||
    weatherEnvironment === item.environment
  ) {
    score += 15;

    if (
      weatherEnvironment !== "ALL"
    ) {
      reasons.push(
        "오늘 날씨와 잘 맞아"
      );
    }
  }

  if (isSaved) {
    score += 10;

    reasons.unshift(
      "저장한 활동이라 취향 점수 +10"
    );
  }

  if (isDisliked) {
    score -= 15;

    reasons.unshift(
      "관심 없음 기록으로 -15"
    );
  }

  score = Math.max(
    0,
    Math.min(score, 100)
  );

  const segments = [
    {
      start: 0,
      end: 25,
      className: "danger",
    },
    {
      start: 25,
      end: 50,
      className: "warning",
    },
    {
      start: 50,
      end: 75,
      className: "good",
    },
    {
      start: 75,
      end: 100,
      className: "great",
    },
  ];

  function getFill(
    start: number,
    end: number
  ) {
    if (score <= start) return 0;
    if (score >= end) return 100;

    return (
      ((score - start) /
        (end - start)) *
      100
    );
  }

  return (
    <div className="recommendation-fit">

      <div className="fit-gauge-area">

        <div className="fit-gauge-head">
          <span>
            추천 적합도
          </span>

          <strong>
            {score}%
          </strong>
        </div>

        <div className="fit-battery">

          {segments.map(
            (segment) => (
              <div
                className="fit-segment"
                key={segment.end}
              >
                <div
                  className={
                    `fit-segment-fill ${segment.className}`
                  }
                  style={{
                    width:
                      `${getFill(
                        segment.start,
                        segment.end
                      )}%`,
                  }}
                />
              </div>
            )
          )}

          <div className="fit-battery-tip" />

        </div>

        <div className="fit-gauge-labels">
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

      </div>

      <div className="recommendation-fit-reasons">

        {reasons
          .slice(0, 3)
          .map((reason) => (
            <span key={reason}>
              <Check
                size={11}
                strokeWidth={3}
              />

              {reason}
            </span>
          ))}

      </div>

    </div>
  );
}