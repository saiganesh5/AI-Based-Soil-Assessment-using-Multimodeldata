package com.ganesh.aisoilhealthassessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictResponse {
    private List<Integer> top_indices;
    private List<Double> top_scores;
    private List<String> top_labels;
    private Integer predicted_index;
    private Double predicted_score;
    private String predicted_label;
}
