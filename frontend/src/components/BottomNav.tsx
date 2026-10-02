"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Compass, Heart, House, Route, UserRound } from "lucide-react";
import { getTodayPlan, onTodayPlanChange } from "@/lib/todayPlan";

const tabs = [
  { href: "/", label: "홈", icon: House },
  { href: "/explore", label: "탐색", icon: Compass },
  { href: "/course", label: "오늘 코스", icon: Route },
  { href: "/saved", label: "저장", icon: Heart },
  { href: "/my", label: "MY", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  const count = useSyncExternalStore(onTodayPlanChange, () => getTodayPlan().length, () => 0);
  return <nav className="oji-bottom-nav" aria-label="주요 메뉴">
    {tabs.map(({ href, label, icon: Icon }) => <Link key={href} href={href}
      className={pathname === href ? "is-current" : ""}
      aria-current={pathname === href ? "page" : undefined}>
      <span className="oji-nav-icon"><Icon size={21} />
        {href === "/course" && count > 0 && <span className="oji-course-count" aria-label={`${count}곳 선택됨`}>{count}</span>}
      </span>
      <span>{label}</span>
    </Link>)}
  </nav>;
}
