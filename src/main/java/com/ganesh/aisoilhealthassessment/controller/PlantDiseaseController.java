package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.PredictResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
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
@RequestMapping("/api/plant")
@RequiredArgsConstructor
public class PlantDiseaseController {

    private final RestTemplate restTemplate;
    private final String FASTAPI_URL = "http://localhost:8000";

    @GetMapping("/")
    public ResponseEntity<?> getInfo() {
        return restTemplate.getForEntity(FASTAPI_URL + "/", Map.class);
    }

    @GetMapping("/healthz")
    public ResponseEntity<?> healthCheck() {
        return restTemplate.getForEntity(FASTAPI_URL + "/healthz", Map.class);
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictResponse> predict(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "top_k", defaultValue = "5") int topK) throws Exception {

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

        String url = FASTAPI_URL + "/predict?top_k=" + topK;

        ResponseEntity<PredictResponse> response =
                restTemplate.postForEntity(url, requestEntity, PredictResponse.class);

        return ResponseEntity.ok(response.getBody());
    }
}
