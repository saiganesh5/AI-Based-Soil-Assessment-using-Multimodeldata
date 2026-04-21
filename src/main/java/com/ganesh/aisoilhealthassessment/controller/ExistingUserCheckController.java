package com.ganesh.aisoilhealthassessment.controller;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class ExistingUserCheckController {

    private final UserRepository userRepository;

    @GetMapping("/register/check-if-username-exists")
    public ResponseEntity<Boolean> checkIfUserNameExists(@RequestParam String userName){
        if(userName==null||userName.isBlank()){
            return ResponseEntity.badRequest().build();
        }

        boolean exists = userRepository.existsByUsername(userName);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/register/check-if-email-exists")
    public ResponseEntity<Boolean> checkIfEmailExists(@RequestParam String mailId){
        if(mailId==null||mailId.isBlank()){
            return ResponseEntity.badRequest().build();
        }

        boolean exists = userRepository.existsByEmail(mailId.trim().toLowerCase());
        return ResponseEntity.ok(exists);
    }
}
