"use client";

import { useEffect, useRef } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import Link from "next/link";
import ManualPlaceSearch from "./ManualPlaceSearch";

export default function LocationSearchDialog({ open, error, loading, activity, onClose, onLocate }: {
  open: boolean; error: string; loading: boolean; activity?: string;
  onClose: () => void; onLocate: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);

  return (
    <dialog ref={dialog} className="location-dialog" aria-labelledby="location-dialog-title" onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="location-dialog-body">
        <div className="location-dialog-heading">
          <span className="location-dialog-icon"><MapPin size={22} /></span>
          <button type="button" aria-label="장소 검색 닫기" onClick={onClose}><X size={20} /></button>
        </div>
        <h2 id="location-dialog-title">어디에서 놀까?</h2>
        <p className="location-dialog-description">내 주변이나 원하는 동네에서 찾아봐.</p>
        <button type="button" className="locate-action" onClick={onLocate} disabled={loading}>
          <LocateFixed size={18} />{loading ? "현재 위치 확인 중…" : "현재 위치로 찾기"}
        </button>
        {error && <p className="location-inline-error" role="status">{error}</p>}
        <div className="location-divider"><span>또는</span></div>
        <ManualPlaceSearch activity={activity} />
        <Link className="location-search-more" href={activity ? `/nearby?query=${encodeURIComponent(activity)}` : "/nearby"}>카페·노래방 등 활동 이름으로 검색 →</Link>
      </div>
    </dialog>
  );
}
