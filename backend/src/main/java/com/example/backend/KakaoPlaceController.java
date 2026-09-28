package com.example.backend;

import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/real-places")
@CrossOrigin(origins = "http://localhost:3000")
public class KakaoPlaceController {

    @Value("${kakao.rest-api-key:}")
    private String kakaoRestApiKey;

    private final RestClient restClient = RestClient.create();

    @GetMapping
    public ResponseEntity<?> searchPlaces(
            @RequestParam String query,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") int radius,
            @RequestParam(defaultValue = "15") int limit
    ) {

        if (kakaoRestApiKey == null || kakaoRestApiKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "message",
                            "KAKAO_REST_API_KEY가 설정되지 않았습니다."
                    ));
        }

        int safeRadius = Math.min(Math.max(radius, 100), 20000);
        int safeLimit = Math.min(Math.max(limit, 1), 45);

        List<Map<String, Object>> results = new ArrayList<>();
        Set<String> usedIds = new HashSet<>();

        int page = 1;

        try {

            while (results.size() < safeLimit && page <= 3) {

                int remaining = safeLimit - results.size();
                int pageSize = Math.min(remaining, 15);

                URI uri = UriComponentsBuilder
                        .fromUriString(
                                "https://dapi.kakao.com/v2/local/search/keyword.json"
                        )
                        .queryParam("query", query)
                        .queryParam("x", lng)
                        .queryParam("y", lat)
                        .queryParam("radius", safeRadius)
                        .queryParam("sort", "distance")
                        .queryParam("size", pageSize)
                        .queryParam("page", page)
                        .build()
                        .encode()
                        .toUri();

                JsonNode response = restClient
                        .get()
                        .uri(uri)
                        .header(
                                "Authorization",
                                "KakaoAK " + kakaoRestApiKey
                        )
                        .retrieve()
                        .body(JsonNode.class);

                if (response == null) {
                    break;
                }

                JsonNode documents = response.get("documents");

                if (documents == null || !documents.isArray()) {
                    break;
                }

                for (JsonNode place : documents) {

                    String id = text(place, "id");

                    if (id.isBlank() || usedIds.contains(id)) {
                        continue;
                    }

                    usedIds.add(id);

                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("id", id);
                    item.put("place_name", text(place, "place_name"));
                    item.put("category", text(place, "category_name"));

                    String roadAddress =
                            text(place, "road_address_name");

                    String address =
                            text(place, "address_name");

                    item.put(
                            "address",
                            !roadAddress.isBlank()
                                    ? roadAddress
                                    : address
                    );

                    item.put("phone", text(place, "phone"));

                    item.put(
                            "latitude",
                            parseDouble(text(place, "y"))
                    );

                    item.put(
                            "longitude",
                            parseDouble(text(place, "x"))
                    );

                    item.put(
                            "distance_m",
                            parseInt(text(place, "distance"))
                    );

                    item.put(
                            "place_url",
                            text(place, "place_url")
                    );

                    results.add(item);

                    if (results.size() >= safeLimit) {
                        break;
                    }
                }

                boolean isEnd =
                        response.path("meta")
                                .path("is_end")
                                .asBoolean(true);

                if (isEnd) {
                    break;
                }

                page++;
            }

            return ResponseEntity.ok(results);

        } catch (Exception e) {

            System.err.println(
                    "Kakao place API error: "
                            + e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            "실제 장소 정보를 가져오지 못했습니다."
                    ));
        }
    }

    private String text(JsonNode node, String field) {

        JsonNode value = node.get(field);

        if (value == null || value.isNull()) {
            return "";
        }

        return value.asText("");
    }

    private int parseInt(String value) {

        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return 0;
        }
    }

    private double parseDouble(String value) {

        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 0;
        }
    }
}