package com.example.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    private final JdbcTemplate jdbcTemplate;

    public RecommendationController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> recommend(
            @RequestParam String category,
            @RequestParam int people,
            @RequestParam int budget,
            @RequestParam int hours,
            @RequestParam String mood
    ) {
        String sql = """
            SELECT
                id,
                name,
                emoji,
                description,
                max_budget,
                is_free,
                environment,
                subcategory,
                min_people,
                max_people,
                min_hours,
                mood
            FROM activities
            WHERE category = ?
              AND min_people <= ?
              AND max_people >= ?
              AND max_budget <= ?
              AND min_hours <= ?
            ORDER BY
              CASE WHEN mood = ? THEN 0 ELSE 1 END,
              max_budget ASC
            LIMIT 30
            """;

        return jdbcTemplate.queryForList(
                sql,
                category,
                people,
                people,
                budget,
                hours,
                mood
        );
    }
}