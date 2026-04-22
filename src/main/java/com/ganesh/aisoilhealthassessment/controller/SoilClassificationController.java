package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.SoilPredictResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/soil")
@RequiredArgsConstructor
public class SoilClassificationController {

    private final RestTemplate restTemplate;
    private final String FASTAPI_URL = "https://ai-based-soil-assessment-using-multimodeldata-production.up.railway.app";

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return restTemplate.getForEntity(FASTAPI_URL + "/health", Map.class);
    }

    @PostMapping("/predict-soil-type")
    public ResponseEntity<SoilPredictResponse> predictSoilType(
            @RequestParam("file") MultipartFile file) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        ResponseEntity<SoilPredictResponse> response =
                restTemplate.postForEntity(
                        FASTAPI_URL + "/predict-upload",
                        requestEntity,
                        SoilPredictResponse.class
                );

        return ResponseEntity.ok(response.getBody());
    }
}
