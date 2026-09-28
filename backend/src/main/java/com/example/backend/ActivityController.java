package com.example.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityController {

    private final JdbcTemplate jdbcTemplate;

    public ActivityController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getActivities(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "false") boolean freeOnly,
            @RequestParam(defaultValue = "ALL") String environment
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                id,
                category,
                name,
                emoji,
                description,
                max_budget,
                is_free,
                environment,
                subcategory
            FROM activities
            WHERE 1 = 1
            """);

        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank() && !category.equals("ALL")) {
            sql.append(" AND category = ?");
            params.add(category);
        }

        if (q != null && !q.isBlank()) {
            sql.append("""
                 AND (
                    LOWER(name) LIKE LOWER(?)
                    OR LOWER(description) LIKE LOWER(?)
                    OR LOWER(COALESCE(subcategory, '')) LIKE LOWER(?)
                 )
                """);

            String keyword = "%" + q.trim() + "%";

            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        if (freeOnly) {
            sql.append(" AND is_free = true");
        }

        if (environment != null && !environment.equals("ALL")) {
            sql.append(" AND environment = ?");
            params.add(environment);
        }

        sql.append("""
             ORDER BY
                is_free DESC,
                max_budget ASC,
                id ASC
             LIMIT 100
            """);

        return jdbcTemplate.queryForList(
                sql.toString(),
                params.toArray()
        );
    }
}