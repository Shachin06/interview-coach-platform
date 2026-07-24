package com.coach.interview.controller;

import com.coach.interview.model.FeedbackMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/interview/telemetry")
    public void handleTelemetry(Map<String, Object> payload) {
        try {
            Long sessionId = Long.valueOf(payload.get("sessionId").toString());
            String type = payload.get("type").toString(); // e.g. "SPEECH" or "VISION"
            
            if ("VISION".equals(type)) {
                boolean eyeContact = (boolean) payload.getOrDefault("eyeContact", true);
                double confidence = Double.parseDouble(payload.getOrDefault("confidence", "0.8").toString());
                
                if (!eyeContact) {
                    FeedbackMessage feedback = new FeedbackMessage(
                            sessionId, 
                            "VISUAL", 
                            "Tip: Maintain eye contact with the camera to project confidence.", 
                            0.3
                    );
                    messagingTemplate.convertAndSend("/topic/feedback/" + sessionId, feedback);
                } else if (confidence < 0.5) {
                    FeedbackMessage feedback = new FeedbackMessage(
                            sessionId, 
                            "VISUAL", 
                            "Tip: Keep a relaxed posture and smile to show enthusiasm.", 
                            confidence
                    );
                    messagingTemplate.convertAndSend("/topic/feedback/" + sessionId, feedback);
                }
            } 
            else if ("SPEECH".equals(type)) {
                String transcript = payload.getOrDefault("text", "").toString();
                int wordCount = transcript.split("\\s+").length;
                double durationSeconds = Double.parseDouble(payload.getOrDefault("durationSeconds", "1.0").toString());
                
                // Calculate words per minute (WPM)
                double wpm = (wordCount / durationSeconds) * 60;
                
                if (wpm > 150) {
                    FeedbackMessage feedback = new FeedbackMessage(
                            sessionId, 
                            "SPEECH_RATE", 
                            "Alert: You are speaking a bit fast (" + Math.round(wpm) + " WPM). Try to slow down and articulate.", 
                            wpm
                    );
                    messagingTemplate.convertAndSend("/topic/feedback/" + sessionId, feedback);
                } else if (wpm < 80 && wordCount > 3) {
                    FeedbackMessage feedback = new FeedbackMessage(
                            sessionId, 
                            "SPEECH_RATE", 
                            "Alert: Pause observed. Use transitions like 'Moving to the next point...' instead of filler words.", 
                            wpm
                    );
                    messagingTemplate.convertAndSend("/topic/feedback/" + sessionId, feedback);
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing WebSocket telemetry: " + e.getMessage());
        }
    }
}
