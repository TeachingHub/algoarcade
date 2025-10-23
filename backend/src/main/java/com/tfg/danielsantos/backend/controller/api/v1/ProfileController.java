package com.tfg.danielsantos.backend.controller.api.v1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) throws FirebaseAuthException {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
        UserRecord userRecord = firebaseAuth.getUser(uid);

        Map<String, Object> profile = new HashMap<>();
        profile.put("uid", userRecord.getUid());
        profile.put("email", userRecord.getEmail());
        profile.put("displayName", userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "");
        profile.put("emailVerified", userRecord.isEmailVerified());
        profile.put("creationTime", userRecord.getUserMetadata().getCreationTimestamp());
        profile.put("lastSignIn", userRecord.getUserMetadata().getLastSignInTimestamp());

        return ResponseEntity.ok(profile);
    }
}