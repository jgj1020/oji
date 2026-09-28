export type TodayPlanPlace = {
  id: string | number;
  place_name: string;
  category?: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  place_url?: string;
};

const PLAN_KEY = "oji-today-plan";
const LEGACY_KEY = "oji-selected-place";
const EVENT_NAME = "oji-today-plan-updated";

export function getTodayPlan(): TodayPlanPlace[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(PLAN_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(PLAN_KEY);
    }
  }

  // 기존 한 장소 저장 데이터가 있으면 자동으로 새 코스로 이동
  const legacy = localStorage.getItem(LEGACY_KEY);

  if (legacy) {
    try {
      const place = JSON.parse(legacy);

      if (place && place.id !== undefined) {
        const migrated = [place];

        saveTodayPlan(migrated);

        return migrated;
      }
    } catch {
      localStorage.removeItem(LEGACY_KEY);
    }
  }

  return [];
}

export function saveTodayPlan(
  plan: TodayPlanPlace[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    PLAN_KEY,
    JSON.stringify(plan)
  );

  // 기존 기능도 깨지지 않게 마지막 장소는 같이 유지
  const last = plan[plan.length - 1];

  if (last) {
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify(last)
    );
  } else {
    localStorage.removeItem(LEGACY_KEY);
  }

  window.dispatchEvent(
    new Event(EVENT_NAME)
  );
}

export function toggleTodayPlan(
  place: TodayPlanPlace
) {
  const current = getTodayPlan();

  const exists = current.some(
    (item) =>
      String(item.id) === String(place.id)
  );

  const next = exists
    ? current.filter(
        (item) =>
          String(item.id) !== String(place.id)
      )
    : [...current, place];

  saveTodayPlan(next);

  return next;
}

export function removeTodayPlanPlace(
  id: string | number
) {
  const next = getTodayPlan().filter(
    (item) =>
      String(item.id) !== String(id)
  );

  saveTodayPlan(next);

  return next;
}

export function clearTodayPlan() {
  saveTodayPlan([]);
}

export function onTodayPlanChange(
  callback: () => void
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener(
    EVENT_NAME,
    handler
  );

  window.addEventListener(
    "storage",
    handler
  );

  return () => {
    window.removeEventListener(
      EVENT_NAME,
      handler
    );

    window.removeEventListener(
      "storage",
      handler
    );
  };
}
export function moveTodayPlanPlace(
  index: number,
  direction: "up" | "down"
) {
  const current = getTodayPlan();

  const targetIndex =
    direction === "up"
      ? index - 1
      : index + 1;

  if (
    index < 0 ||
    index >= current.length ||
    targetIndex < 0 ||
    targetIndex >= current.length
  ) {
    return current;
  }

  const next = [...current];

  const temp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = temp;

  saveTodayPlan(next);

  return next;
}