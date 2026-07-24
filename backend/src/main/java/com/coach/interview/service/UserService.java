package com.coach.interview.service;

import com.coach.interview.model.User;
import com.coach.interview.repository.UserRepository;
import com.coach.interview.config.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public User registerUser(String username, String password, String email, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        String userRole = "admin".equalsIgnoreCase(role) ? "ROLE_ADMIN" : "ROLE_USER";
        User user = new User(username, passwordEncoder.encode(password), email, Set.of(userRole));
        return userRepository.save(user);
    }

    public Map<String, Object> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getUsername());
        boolean isAdmin = user.getRoles() != null && user.getRoles().contains("ROLE_ADMIN");
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", isAdmin ? "admin" : "user");
        response.put("isAdmin", isAdmin);
        return response;
    }
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
