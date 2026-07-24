package com.coach.interview.model;

public class FeedbackMessage {
    private Long sessionId;
    private String type; // e.g. "VISUAL", "SPEECH_RATE", "CLARITY"
    private String text; // e.g. "Try to maintain eye contact with the lens."
    private double value; // score or magnitude

    public FeedbackMessage() {}

    public FeedbackMessage(Long sessionId, String type, String text, double value) {
        this.sessionId = sessionId;
        this.type = type;
        this.text = text;
        this.value = value;
    }

    // Getters and Setters
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
}
