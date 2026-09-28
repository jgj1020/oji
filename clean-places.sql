-- 서울 밖으로 확인되는 데이터 제거
DELETE FROM places
WHERE source = 'OSM'
  AND address <> '서울특별시'
  AND address NOT LIKE '서울특별시%';

-- 아파트/단지 내부 시설이나 추천 가치가 낮은 공원 데이터 제거
DELETE FROM places
WHERE source = 'OSM'
  AND place_type = 'PARK'
  AND (
       name LIKE '%놀이터%'
    OR name LIKE '%옥상%'
    OR name LIKE '%테니스장%'
    OR name LIKE '%운동장%'
    OR name LIKE '%조성사업지%'
    OR name LIKE '%초입%'
    OR name ~ '^[0-9]+동'
    OR name ~ '^[0-9]+단지'
  );

-- 이름이 너무 일반적인 체육시설 제거
DELETE FROM places
WHERE source = 'OSM'
  AND (
       name = '농구장'
    OR name = '농구장1'
    OR name = '농구장2'
    OR name LIKE '농구장(%'
  );