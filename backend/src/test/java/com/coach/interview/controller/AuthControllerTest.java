package com.coach.interview.controller;

import com.coach.interview.model.User;
import com.coach.interview.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterSuccess() throws Exception {
        User mockUser = new User("testuser", "encodedPassword", "test@test.com", Set.of("ROLE_USER"));
        mockUser.setId(1L);

        Mockito.when(userService.registerUser("testuser", "password123", "test@test.com", "user"))
                .thenReturn(mockUser);

        Map<String, String> request = Map.of(
                "username", "testuser",
                "password", "password123",
                "email", "test@test.com"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    public void testLoginSuccess() throws Exception {
        Map<String, Object> mockAuthResponse = Map.of(
                "token", "mock-jwt-token",
                "username", "testuser"
        );

        Mockito.when(userService.authenticateUser("testuser", "password123"))
                .thenReturn(mockAuthResponse);

        Map<String, String> request = Map.of(
                "username", "testuser",
                "password", "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }
}
