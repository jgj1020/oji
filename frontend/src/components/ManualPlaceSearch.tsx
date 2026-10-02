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
      <label htmlFor={id}>위치 권한 없이 지역으로 찾기</label>
      <div>
        <input id={id} value={region} onChange={(event) => setRegion(event.target.value)}
          placeholder="예: 성수동, 부산 서면" required maxLength={80} />
        <button type="submit" disabled={!region.trim()}>지도 검색</button>
      </div>
      <small>입력한 지역의 {activity} 검색 결과를 네이버 지도에서 열어.</small>
    </form>
  );
}
