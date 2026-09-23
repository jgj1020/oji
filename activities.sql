TRUNCATE TABLE activities RESTART IDENTITY;

INSERT INTO activities
(category, name, emoji, min_people, max_people, max_budget, min_hours, mood, description)
VALUES
('PLAY', '볼링', '🎳', 2, 8, 20000, 1, 'ACTIVE', '여럿이 가볍게 즐기기 좋은 활동'),
('PLAY', '방탈출', '🧩', 2, 6, 30000, 1, 'EXCITING', '같이 문제를 풀면서 즐기는 체험'),
('PLAY', '노래방', '🎤', 1, 8, 15000, 1, 'EXCITING', '부담 없이 신나게 놀기 좋은 선택'),

('FOOD', '고기 먹기', '🥩', 2, 8, 30000, 1, 'RELAX', '편하게 이야기하며 식사하기 좋음'),
('FOOD', '라멘 맛집 가기', '🍜', 1, 4, 15000, 1, 'RELAX', '간단하게 맛있는 음식 먹기'),

('CAFE', '감성 카페', '☕', 1, 6, 15000, 1, 'RELAX', '쉬면서 이야기하거나 사진 찍기 좋음'),

('EXPERIENCE', '공방 체험', '🎨', 1, 4, 30000, 2, 'NEW', '새로운 걸 직접 만들어보는 체험'),

('ACTIVE', '배드민턴', '🏸', 2, 6, 10000, 1, 'ACTIVE', '가볍게 운동하면서 놀기 좋음'),
('ACTIVE', '클라이밍', '🧗', 1, 4, 30000, 2, 'ACTIVE', '몸을 쓰면서 도전하는 활동'),

('WATCH', '영화 보기', '🎬', 1, 6, 20000, 2, 'RELAX', '편하게 시간을 보내기 좋은 선택');