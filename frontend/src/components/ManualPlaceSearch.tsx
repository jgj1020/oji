"use client";

import { useId, useState } from "react";

/** A map search fallback, not a substitute for GPS coordinates. */
export default function ManualPlaceSearch({ activity = "놀거리" }: { activity?: string }) {
  const [region, setRegion] = useState("");
  const id = useId();

  return (
    <form className="manual-place-search" onSubmit={(event) => {
      event.preventDefault();
      if (!region.trim()) return;
      window.location.assign(`https://map.naver.com/p/search/${encodeURIComponent(`${region.trim()} ${activity}`)}`);
    }}>
      <label htmlFor={id}>동네 직접 입력</label>
      <div>
        <input id={id} value={region} onChange={(event) => setRegion(event.target.value)}
          placeholder="예: 성수동, 부산 서면" required maxLength={80} />
        <button type="submit" disabled={!region.trim()}>찾기</button>
      </div>
      <small>{activity} · 네이버 지도에서 결과를 확인해.</small>
    </form>
  );
}
