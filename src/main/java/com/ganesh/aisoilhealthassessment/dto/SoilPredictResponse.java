package com.ganesh.aisoilhealthassessment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoilPredictResponse {

    @JsonProperty("is_soil")
    private Boolean isSoil;

    @JsonProperty("predicted_index")
    private Integer predictedIndex;

    @JsonProperty("predicted_label")
    private String predictedLabel;

    private Double confidence;

    private List<Double> probabilities;
}
