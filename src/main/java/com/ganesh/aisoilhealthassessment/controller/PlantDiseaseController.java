package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.PredictResponse;
import com.ganesh.aisoilhealthassessment.service.GeminiDiseaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/plant")
@RequiredArgsConstructor
@Slf4j
public class PlantDiseaseController {

    private final GeminiDiseaseService geminiDiseaseService;

    @GetMapping("/")
    public ResponseEntity<?> getInfo() {
        return ResponseEntity.ok(Map.of(
                "service", "Plant Disease Prediction",
                "provider", "Gemini Vision AI",
                "status", "active"
        ));
    }

    @GetMapping("/healthz")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictResponse> predict(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "top_k", defaultValue = "5") int topK) {

        try {
            log.info("Received disease prediction request - file: {}, size: {} bytes, top_k: {}",
                    file.getOriginalFilename(), file.getSize(), topK);

            PredictResponse response = geminiDiseaseService.analyzeImage(file, topK);

            log.info("Prediction complete - top disease: {} (score: {})",
                    response.getPredicted_label(), response.getPredicted_score());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Disease prediction failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
