import {
  Gamepad2,
  Utensils,
  Coffee,
  Palette,
  Dumbbell,
  Clapperboard,
  Footprints,
  Bike,
  Mountain,
  Music2,
  Mic2,
  Monitor,
  Dices,
  Target,
  CircleDot,
  Trophy,
  Trees,
  BookOpen,
  Camera,
  Paintbrush,
  CookingPot,
  Glasses,
  TentTree,
  CakeSlice,
  Pizza,
  Soup,
  Sandwich,
  Volleyball,
  Sparkles,
} from "lucide-react";

type Props = {
  category?: string;
  subcategory?: string;
  name?: string;
  size?: number;
};

export default function ActivityIcon({
  category = "",
  subcategory = "",
  name = "",
  size = 24,
}: Props) {
  const text = `${name} ${subcategory}`.toLowerCase();

  if (text.includes("노래") || text.includes("음악")) {
    return <Mic2 size={size} />;
  }

  if (text.includes("pc") || text.includes("게임")) {
    return <Gamepad2 size={size} />;
  }

  if (text.includes("보드게임")) {
    return <Dices size={size} />;
  }

  if (text.includes("다트")) {
    return <Target size={size} />;
  }

  if (text.includes("당구")) {
    return <CircleDot size={size} />;
  }

  if (
    text.includes("축구") ||
    text.includes("농구") ||
    text.includes("야구") ||
    text.includes("배드민턴") ||
    text.includes("테니스") ||
    text.includes("스포츠")
  ) {
    return <Trophy size={size} />;
  }

  if (text.includes("산책") || text.includes("러닝")) {
    return <Footprints size={size} />;
  }

  if (text.includes("자전거")) {
    return <Bike size={size} />;
  }

  if (text.includes("등산")) {
    return <Mountain size={size} />;
  }

  if (text.includes("공원") || text.includes("한강")) {
    return <Trees size={size} />;
  }

  if (text.includes("책") || text.includes("도서관")) {
    return <BookOpen size={size} />;
  }

  if (text.includes("사진")) {
    return <Camera size={size} />;
  }

  if (
    text.includes("그림") ||
    text.includes("공방") ||
    text.includes("도자기")
  ) {
    return <Paintbrush size={size} />;
  }

  if (text.includes("요리") || text.includes("쿠킹")) {
    return <CookingPot size={size} />;
  }

  if (text.includes("vr")) {
    return <Glasses size={size} />;
  }

  if (text.includes("피크닉")) {
    return <TentTree size={size} />;
  }

  if (text.includes("디저트") || text.includes("베이커리")) {
    return <CakeSlice size={size} />;
  }

  if (text.includes("피자")) {
    return <Pizza size={size} />;
  }

  if (
    text.includes("라멘") ||
    text.includes("국밥") ||
    text.includes("마라")
  ) {
    return <Soup size={size} />;
  }

  if (
    text.includes("햄버거") ||
    text.includes("편의점")
  ) {
    return <Sandwich size={size} />;
  }

  switch (category) {
    case "PLAY":
      return <Gamepad2 size={size} />;

    case "FOOD":
      return <Utensils size={size} />;

    case "CAFE":
      return <Coffee size={size} />;

    case "EXPERIENCE":
      return <Palette size={size} />;

    case "ACTIVE":
      return <Dumbbell size={size} />;

    case "WATCH":
      return <Clapperboard size={size} />;

    default:
      return <Sparkles size={size} />;
  }
}