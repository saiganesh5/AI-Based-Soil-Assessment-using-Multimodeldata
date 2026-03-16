package com.ganesh.aisoilhealthassessment.controller;


import com.ganesh.aisoilhealthassessment.model.User;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {


 private final UserRepository repository;

    @CrossOrigin("*")
    @PostMapping("/addUser")
    public void addUser(@RequestBody User user){
        repository.save(user);
    }

    @Transactional
    @DeleteMapping("/rmUser/{id}")
    public void removeUser(@PathVariable long id){
        repository.removeUsersById(id);
    }
}
