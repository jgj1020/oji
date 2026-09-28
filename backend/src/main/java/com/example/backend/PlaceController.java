package com.example.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "http://localhost:3000")
public class PlaceController {

    private final JdbcTemplate jdbcTemplate;

    public PlaceController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/nearby")
    public List<Map<String, Object>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "ALL") String category,
            @RequestParam(defaultValue = "20") int limit
    ) {

        int safeLimit = Math.min(Math.max(limit, 1), 50);

        String sql = """
            SELECT
                p.id,
                p.name AS place_name,
                p.address,
                p.latitude,
                p.longitude,

                a.id AS activity_id,
                a.name AS activity_name,
                a.emoji,
                a.category,
                a.is_free,
                p.fee_status,
                p.place_type,
                a.environment,
                a.subcategory,

                ROUND(
                    CAST(
                        (
                            6371000 * 2 * ASIN(
                                SQRT(
                                    POWER(
                                        SIN(
                                            RADIANS(p.latitude - ?) / 2
                                        ),
                                        2
                                    )
                                    +
                                    COS(RADIANS(?))
                                    *
                                    COS(RADIANS(p.latitude))
                                    *
                                    POWER(
                                        SIN(
                                            RADIANS(p.longitude - ?) / 2
                                        ),
                                        2
                                    )
                                )
                            )
                        )
                    AS NUMERIC),
                    0
                ) AS distance_m

            FROM places p

            JOIN activities a
              ON a.id = p.activity_id

            WHERE (? = 'ALL' OR a.category = ?)

            ORDER BY distance_m ASC

            LIMIT ?
            """;

        return jdbcTemplate.queryForList(
                sql,
                lat,
                lat,
                lng,
                category,
                category,
                safeLimit
        );
    }
}