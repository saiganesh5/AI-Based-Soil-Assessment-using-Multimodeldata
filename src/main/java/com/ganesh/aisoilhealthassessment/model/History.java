package com.ganesh.aisoilhealthassessment.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class History {
    @Id
    private long id;
    private String userHistory;
    private String soilParameterHistory;
    private String climate;
    private String cropRecommendation;
    private String fertilizerRecommendation;
    private String disease;
}