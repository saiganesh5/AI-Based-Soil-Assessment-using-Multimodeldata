package com.ganesh.aisoilhealthassessment.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/")
public class TestController {

    @CrossOrigin("*")
    @GetMapping("/greet")
    public String greet(){
        return "Backend is running";
    }
}
