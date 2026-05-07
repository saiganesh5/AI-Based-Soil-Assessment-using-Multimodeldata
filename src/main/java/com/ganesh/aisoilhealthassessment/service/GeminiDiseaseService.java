package com.ganesh.aisoilhealthassessment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ganesh.aisoilhealthassessment.dto.PredictResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiDiseaseService {

    private final RestTemplate restTemplate;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private static final int MAX_RETRIES = 2;

    private static final String DISEASE_PROMPT = """
            You are an expert plant pathologist and agricultural scientist. Analyze this image of a plant/crop leaf carefully and identify the top %d most likely diseases or conditions.

            Rules:
            - If the leaf appears healthy, the top prediction should be "Healthy" with a high confidence score.
            - Use standard plant disease naming conventions (e.g., "Tomato Late Blight", "Corn Common Rust", "Apple Black Rot", "Potato Early Blight").
            - Use readable names with spaces, not underscores.
            - Confidence scores must be between 0.0 and 1.0, ordered from highest to lowest.
            - Consider the leaf shape, color, spots, lesions, wilting, and other visual symptoms.

            Respond ONLY with valid JSON in this exact format, no markdown, no explanation, no extra text:
            {"predictions":[{"label":"Disease Name","score":0.95},{"label":"Disease Name 2","score":0.03},{"label":"Disease Name 3","score":0.01},{"label":"Disease Name 4","score":0.005},{"label":"Disease Name 5","score":0.005}]}
            """;

    public PredictResponse analyzeImage(MultipartFile file, int topK) throws Exception {
        // Convert image to base64
        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        // Build the Gemini API request body
        Map<String, Object> requestBody = buildGeminiRequest(base64Image, mimeType, topK);

        // Call Gemini API with retry logic for transient 503 errors
        String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        log.info("Calling Gemini API for disease prediction with model: {}", geminiModel);

        String responseBody = callGeminiWithRetry(url, requestEntity);

        // Parse the Gemini response
        return parseGeminiResponse(responseBody, topK);
    }

    /**
     * Calls the Gemini API with retry logic for transient 503 errors.
     * Uses byte[] response type to avoid Jackson 3.x String deserialization issues.
     */
    private String callGeminiWithRetry(String url, HttpEntity<Map<String, Object>> requestEntity) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Use byte[] to avoid Jackson 3.x String deserialization mismatch
                ResponseEntity<byte[]> response = restTemplate.postForEntity(url, requestEntity, byte[].class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new RuntimeException("Gemini API returned status: " + response.getStatusCode());
                }

                return new String(response.getBody(), StandardCharsets.UTF_8);

            } catch (HttpServerErrorException.ServiceUnavailable e) {
                lastException = e;
                log.warn("Gemini API returned 503 (attempt {}/{}). Retrying after delay...", attempt, MAX_RETRIES);
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(2000L * attempt); // Exponential backoff: 2s, 4s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            } catch (HttpServerErrorException e) {
                // For other 5xx errors, don't retry
                log.error("Gemini API server error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException("Gemini API error: " + e.getMessage(), e);
            }
        }

        throw new RuntimeException("Gemini API unavailable after " + MAX_RETRIES + " retries", lastException);
    }

    private Map<String, Object> buildGeminiRequest(String base64Image, String mimeType, int topK) {
        // Build inline data part (image)
        Map<String, Object> inlineData = new LinkedHashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);

        Map<String, Object> imagePart = new LinkedHashMap<>();
        imagePart.put("inlineData", inlineData);

        // Build text part (prompt)
        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("text", String.format(DISEASE_PROMPT, topK));

        // Build contents array
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(imagePart, textPart));

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("contents", List.of(content));

        return requestBody;
    }

    private PredictResponse parseGeminiResponse(String responseBody, int topK) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        // Extract the text from Gemini response: candidates[0].content.parts[0].text
        JsonNode candidates = root.path("candidates");
        if (candidates.isEmpty() || !candidates.isArray()) {
            throw new RuntimeException("No candidates in Gemini response");
        }

        String generatedText = candidates.get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        log.debug("Gemini raw response text: {}", generatedText);

        // Extract JSON from the response (it might have markdown code fences)
        String jsonText = extractJson(generatedText);
        JsonNode predictionRoot = objectMapper.readTree(jsonText);
        JsonNode predictions = predictionRoot.path("predictions");

        if (!predictions.isArray() || predictions.isEmpty()) {
            throw new RuntimeException("Invalid prediction format in Gemini response");
        }

        List<Integer> topIndices = new ArrayList<>();
        List<Double> topScores = new ArrayList<>();
        List<String> topLabels = new ArrayList<>();

        int count = Math.min(predictions.size(), topK);
        for (int i = 0; i < count; i++) {
            JsonNode pred = predictions.get(i);
            topIndices.add(i);
            topLabels.add(pred.path("label").asText());
            topScores.add(pred.path("score").asDouble());
        }

        return PredictResponse.builder()
                .top_indices(topIndices)
                .top_scores(topScores)
                .top_labels(topLabels)
                .predicted_index(0)
                .predicted_score(topScores.isEmpty() ? 0.0 : topScores.get(0))
                .predicted_label(topLabels.isEmpty() ? "Unknown" : topLabels.get(0))
                .build();
    }

    /**
     * Extracts JSON object from a string that may contain markdown code fences or
     * extra text.
     */
    private String extractJson(String text) {
        // Remove markdown code fences if present
        String cleaned = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        // Find the first { and last }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start == -1 || end == -1 || end <= start) {
            throw new RuntimeException("Could not extract JSON from Gemini response: " + text);
        }
        return cleaned.substring(start, end + 1);
    }
}
