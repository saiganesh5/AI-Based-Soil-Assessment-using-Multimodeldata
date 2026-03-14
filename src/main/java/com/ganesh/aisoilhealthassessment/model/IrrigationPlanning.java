package com.ganesh.aisoilhealthassessment.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class IrrigationPlanning {
    @Id
    private long id;
}
