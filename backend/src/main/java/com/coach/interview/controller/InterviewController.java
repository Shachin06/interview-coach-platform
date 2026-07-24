package com.coach.interview.controller;

import com.coach.interview.model.InterviewSession;
import com.coach.interview.model.Question;
import com.coach.interview.model.User;
import com.coach.interview.service.InterviewService;
import com.coach.interview.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private StorageService storageService;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "Medium") String difficulty) {
        try {
            List<Question> questions = interviewService.getQuestionsByCategoryAndDifficulty(category, difficulty);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startInterview(@RequestBody Map<String, String> request) {
        try {
            User user = getAuthenticatedUser();
            String category = request.getOrDefault("category", "Software Engineering");
            String difficulty = request.getOrDefault("difficulty", "Medium");
            
            InterviewSession session = interviewService.startSession(user, category, difficulty);
            return ResponseEntity.ok(Map.of("sessionId", session.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        try {
            User user = getAuthenticatedUser();
            List<InterviewSession> sessions = interviewService.getUserSessions(user);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable Long sessionId) {
        try {
            InterviewSession session = interviewService.getSessionById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/submit/{sessionId}")
    public ResponseEntity<?> submitInterview(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> request) {
        try {
            // Extracts transcript JSON list from request
            Object qaList = request.get("answers");
            ObjectMapper mapper = new ObjectMapper();
            String qaJson = mapper.writeValueAsString(qaList);

            InterviewSession session = interviewService.submitSessionAnswers(sessionId, qaJson);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload/{sessionId}")
    public ResponseEntity<?> uploadRecording(
            @PathVariable Long sessionId,
            @RequestParam("video") MultipartFile file) {
        try {
            String videoPath = storageService.storeFile(file, "interviews");
            interviewService.updateVideoPath(sessionId, videoPath);
            return ResponseEntity.ok(Map.of("videoPath", videoPath));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
