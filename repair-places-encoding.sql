DROP TABLE IF EXISTS places_encoding_backup;

CREATE TABLE places_encoding_backup AS
SELECT *
FROM places
WHERE source = 'OSM';


CREATE OR REPLACE FUNCTION repair_mojibake(value text)
RETURNS text AS $$
BEGIN

    IF value IS NULL THEN
        RETURN NULL;
    END IF;

    BEGIN
        RETURN convert_from(
            convert_to(value, 'LATIN1'),
            'UTF8'
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN value;
    END;

END;
$$ LANGUAGE plpgsql;


UPDATE places
SET
    name = repair_mojibake(name),
    address = repair_mojibake(address)
WHERE source = 'OSM';


UPDATE places
SET address = '서울특별시'
WHERE source = 'OSM'
  AND address = 'Seoul';


DROP FUNCTION repair_mojibake(text);