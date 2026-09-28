CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    address VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

TRUNCATE TABLE places RESTART IDENTITY;

INSERT INTO places
(activity_id, name, address, latitude, longitude)
VALUES

(
    (SELECT id FROM activities WHERE name = '한강 산책' LIMIT 1),
    '망원한강공원',
    '서울특별시 마포구',
    37.55038,
    126.90177
),

(
    (SELECT id FROM activities WHERE name = '한강 산책' LIMIT 1),
    '여의도한강공원',
    '서울특별시 영등포구 여의동로 330',
    37.52773,
    126.93297
),

(
    (SELECT id FROM activities WHERE name = '한강 산책' LIMIT 1),
    '뚝섬한강공원',
    '서울특별시 광진구',
    37.53000,
    127.06869
),

(
    (SELECT id FROM activities WHERE name = '공원 산책' LIMIT 1),
    '서울숲',
    '서울특별시 성동구',
    37.54430,
    127.04150
);