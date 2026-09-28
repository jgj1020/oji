ALTER TABLE activities
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'INDOOR';

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(40);

TRUNCATE TABLE activities RESTART IDENTITY;

INSERT INTO activities
(category, name, emoji, min_people, max_people, max_budget, min_hours, mood, description, is_free, environment, subcategory)
VALUES

-- 놀거리 PLAY
('PLAY','볼링','🎳',2,8,20000,1,'ACTIVE','여럿이 가볍게 즐기기 좋은 활동',FALSE,'INDOOR','스포츠'),
('PLAY','방탈출','🧩',2,6,30000,1,'EXCITING','같이 문제를 풀면서 즐기는 체험',FALSE,'INDOOR','게임'),
('PLAY','노래방','🎤',1,8,15000,1,'EXCITING','부담 없이 신나게 놀기 좋은 선택',FALSE,'INDOOR','음악'),
('PLAY','PC방','🖥️',1,6,10000,1,'RELAX','게임하면서 편하게 놀기 좋은 장소',FALSE,'INDOOR','게임'),
('PLAY','보드게임 카페','🎲',2,8,15000,2,'EXCITING','여럿이 이야기하며 게임하기 좋음',FALSE,'INDOOR','게임'),
('PLAY','다트','🎯',2,6,15000,1,'ACTIVE','가볍게 경쟁하며 즐기기 좋은 활동',FALSE,'INDOOR','게임'),
('PLAY','당구','🎱',2,6,15000,1,'RELAX','친구와 편하게 즐기기 좋은 활동',FALSE,'INDOOR','스포츠'),
('PLAY','탁구','🏓',2,4,10000,1,'ACTIVE','짧게 몸을 움직이며 놀기 좋음',FALSE,'INDOOR','스포츠'),
('PLAY','코인노래방','🎙️',1,4,5000,1,'EXCITING','짧고 저렴하게 노래 부르기 좋음',FALSE,'INDOOR','음악'),
('PLAY','오락실','🕹️',1,6,10000,1,'EXCITING','여러 게임을 가볍게 즐길 수 있음',FALSE,'INDOOR','게임'),

-- 먹거리 FOOD
('FOOD','고기 먹기','🥩',2,8,30000,1,'RELAX','편하게 이야기하며 식사하기 좋음',FALSE,'INDOOR','한식'),
('FOOD','라멘 맛집 가기','🍜',1,4,15000,1,'RELAX','간단하게 맛있는 음식 먹기',FALSE,'INDOOR','일식'),
('FOOD','떡볶이 먹기','🌶️',1,5,10000,1,'EXCITING','가볍고 저렴하게 즐기기 좋은 메뉴',FALSE,'INDOOR','분식'),
('FOOD','치킨 먹기','🍗',2,6,25000,1,'EXCITING','친구들과 같이 먹기 좋은 메뉴',FALSE,'INDOOR','치킨'),
('FOOD','피자 먹기','🍕',2,6,25000,1,'RELAX','여럿이 나눠 먹기 좋은 음식',FALSE,'INDOOR','양식'),
('FOOD','초밥 먹기','🍣',1,4,30000,1,'RELAX','깔끔하게 식사하기 좋은 선택',FALSE,'INDOOR','일식'),
('FOOD','햄버거 먹기','🍔',1,5,15000,1,'RELAX','빠르고 편하게 먹기 좋음',FALSE,'INDOOR','패스트푸드'),
('FOOD','국밥 먹기','🥘',1,5,12000,1,'RELAX','든든하고 부담 적은 식사',FALSE,'INDOOR','한식'),
('FOOD','마라탕 먹기','🍲',1,6,20000,1,'EXCITING','취향대로 골라 먹는 재미가 있음',FALSE,'INDOOR','중식'),
('FOOD','편의점 음식 조합','🍙',1,4,10000,1,'NEW','저렴하게 새로운 조합을 만들어 먹기',FALSE,'INDOOR','간편식'),

-- 카페 CAFE
('CAFE','감성 카페','☕',1,6,15000,1,'RELAX','쉬면서 이야기하거나 사진 찍기 좋음',FALSE,'INDOOR','감성'),
('CAFE','디저트 카페','🍰',1,5,20000,1,'RELAX','달달한 디저트와 함께 쉬기 좋음',FALSE,'INDOOR','디저트'),
('CAFE','루프탑 카페','🌇',1,6,20000,1,'NEW','풍경을 보며 쉬기 좋은 카페',FALSE,'OUTDOOR','뷰'),
('CAFE','북카페','📚',1,4,15000,2,'RELAX','조용히 책을 보며 쉬기 좋음',FALSE,'INDOOR','조용함'),
('CAFE','대형 카페','🏢',1,8,20000,2,'RELAX','여럿이 방문하기 편한 넓은 카페',FALSE,'INDOOR','대형'),
('CAFE','베이커리 카페','🥐',1,6,20000,1,'RELAX','빵과 음료를 같이 즐기기 좋음',FALSE,'INDOOR','베이커리'),
('CAFE','스터디 카페','💻',1,4,10000,2,'RELAX','조용히 공부하거나 작업하기 좋음',FALSE,'INDOOR','공부'),
('CAFE','테마 카페','✨',1,5,20000,1,'NEW','평소와 다른 분위기를 경험하기 좋음',FALSE,'INDOOR','테마'),
('CAFE','한강 카페','🌊',1,6,15000,1,'RELAX','강 주변에서 쉬기 좋은 선택',FALSE,'OUTDOOR','뷰'),
('CAFE','24시간 카페','🌙',1,5,15000,1,'RELAX','늦은 시간에도 편하게 갈 수 있음',FALSE,'INDOOR','심야'),

-- 체험 EXPERIENCE
('EXPERIENCE','공방 체험','🎨',1,4,30000,2,'NEW','새로운 걸 직접 만들어보는 체험',FALSE,'INDOOR','공방'),
('EXPERIENCE','도자기 만들기','🏺',1,4,40000,2,'NEW','직접 도자기를 만들어보는 체험',FALSE,'INDOOR','공방'),
('EXPERIENCE','향수 만들기','🧴',1,4,40000,2,'NEW','나만의 향을 만들어볼 수 있음',FALSE,'INDOOR','공방'),
('EXPERIENCE','그림 그리기','🖌️',1,5,25000,2,'RELAX','편하게 그림을 그리며 시간 보내기',FALSE,'INDOOR','미술'),
('EXPERIENCE','쿠킹 클래스','👨‍🍳',1,6,50000,3,'NEW','직접 음식을 만들어보는 체험',FALSE,'INDOOR','요리'),
('EXPERIENCE','사진 전시 체험','📸',1,5,20000,2,'RELAX','사진과 전시를 천천히 감상하기',FALSE,'INDOOR','전시'),
('EXPERIENCE','VR 체험','🥽',1,4,25000,1,'EXCITING','가상현실 콘텐츠를 즐길 수 있음',FALSE,'INDOOR','VR'),
('EXPERIENCE','클라이밍 체험','🧗',1,4,30000,2,'ACTIVE','처음 해봐도 재미있는 활동형 체험',FALSE,'INDOOR','스포츠'),
('EXPERIENCE','DIY 키트 만들기','🧵',1,4,20000,2,'NEW','직접 작은 소품을 만들어볼 수 있음',FALSE,'INDOOR','공방'),
('EXPERIENCE','무료 전시 관람','🖼️',1,6,0,2,'RELAX','무료로 전시를 둘러볼 수 있음',TRUE,'INDOOR','전시'),

-- 활동 ACTIVE
('ACTIVE','배드민턴','🏸',2,6,10000,1,'ACTIVE','가볍게 운동하면서 놀기 좋음',FALSE,'INDOOR','라켓'),
('ACTIVE','클라이밍','🧗',1,4,30000,2,'ACTIVE','몸을 쓰면서 도전하는 활동',FALSE,'INDOOR','스포츠'),
('ACTIVE','공공 축구장','⚽',4,20,0,2,'ACTIVE','친구들과 무료로 축구하기 좋은 장소',TRUE,'OUTDOOR','축구'),
('ACTIVE','공공 농구장','🏀',2,10,0,1,'ACTIVE','가볍게 농구하기 좋은 무료 공간',TRUE,'OUTDOOR','농구'),
('ACTIVE','공원 산책','🌳',1,8,0,1,'RELAX','돈 없이 편하게 걷기 좋은 활동',TRUE,'OUTDOOR','산책'),
('ACTIVE','한강 산책','🚶',1,8,0,2,'RELAX','강을 보면서 걷기 좋은 무료 활동',TRUE,'OUTDOOR','산책'),
('ACTIVE','러닝','🏃',1,6,0,1,'ACTIVE','장비 없이 바로 할 수 있는 운동',TRUE,'OUTDOOR','러닝'),
('ACTIVE','자전거 타기','🚲',1,6,10000,2,'ACTIVE','자전거를 타며 이동하고 놀기 좋음',FALSE,'OUTDOOR','자전거'),
('ACTIVE','공공 운동기구','💪',1,4,0,1,'ACTIVE','공원 운동기구로 가볍게 운동하기',TRUE,'OUTDOOR','운동'),
('ACTIVE','등산','🥾',1,8,0,3,'ACTIVE','돈 없이 자연을 즐기며 운동하기',TRUE,'OUTDOOR','등산'),
('ACTIVE','풋살','⚽',4,12,20000,2,'ACTIVE','소규모 인원으로 축구를 즐기기 좋음',FALSE,'OUTDOOR','축구'),
('ACTIVE','야구 캐치볼','⚾',2,6,0,1,'ACTIVE','공원에서 간단하게 캐치볼 즐기기',TRUE,'OUTDOOR','야구'),
('ACTIVE','줄넘기','🪢',1,4,0,1,'ACTIVE','어디서든 짧게 운동하기 좋은 활동',TRUE,'OUTDOOR','운동'),
('ACTIVE','공공 테니스장','🎾',2,4,5000,1,'ACTIVE','저렴하게 테니스를 즐길 수 있음',FALSE,'OUTDOOR','라켓'),
('ACTIVE','스케이트보드','🛹',1,5,0,1,'ACTIVE','공원에서 즐기기 좋은 활동',TRUE,'OUTDOOR','보드'),

-- 볼거리 WATCH
('WATCH','영화 보기','🎬',1,6,20000,2,'RELAX','편하게 시간을 보내기 좋은 선택',FALSE,'INDOOR','영화'),
('WATCH','무료 전시 보기','🖼️',1,6,0,2,'RELAX','돈 없이 전시를 즐길 수 있음',TRUE,'INDOOR','전시'),
('WATCH','야경 보기','🌃',1,6,0,1,'RELAX','밤에 가볍게 풍경을 보러 가기 좋음',TRUE,'OUTDOOR','야경'),
('WATCH','한강 노을 보기','🌅',1,8,0,1,'RELAX','무료로 노을을 즐길 수 있는 활동',TRUE,'OUTDOOR','풍경'),
('WATCH','도서관 구경','📖',1,4,0,2,'RELAX','조용하게 책과 공간을 즐기기 좋음',TRUE,'INDOOR','도서관'),
('WATCH','박물관 관람','🏛️',1,6,10000,2,'NEW','새로운 것을 보고 배우기 좋은 활동',FALSE,'INDOOR','문화'),
('WATCH','거리 공연 보기','🎸',1,8,0,1,'EXCITING','우연히 만나는 공연을 즐길 수 있음',TRUE,'OUTDOOR','공연'),
('WATCH','스포츠 경기 관람','🏟️',1,8,30000,3,'EXCITING','친구들과 응원하며 즐기기 좋음',FALSE,'INDOOR','스포츠'),
('WATCH','무료 문화 행사','🎪',1,8,0,2,'NEW','지역 행사나 축제를 무료로 즐기기',TRUE,'OUTDOOR','행사'),
('WATCH','공원 피크닉','🧺',1,8,10000,2,'RELAX','간단한 음식과 함께 쉬기 좋은 활동',FALSE,'OUTDOOR','피크닉');