package com.coach.interview.model;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String category;
    private String difficulty;
    
    @Column(columnDefinition = "TEXT")
    private String idealKeywords;

    @Column(columnDefinition = "TEXT")
    private String modelAnswer;

    public Question() {}

    public Question(String content, String category, String difficulty, String idealKeywords, String modelAnswer) {
        this.content = content;
        this.category = category;
        this.difficulty = difficulty;
        this.idealKeywords = idealKeywords;
        this.modelAnswer = modelAnswer;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getIdealKeywords() { return idealKeywords; }
    public void setIdealKeywords(String idealKeywords) { this.idealKeywords = idealKeywords; }
    public String getModelAnswer() { return modelAnswer; }
    public void setModelAnswer(String modelAnswer) { this.modelAnswer = modelAnswer; }
}
