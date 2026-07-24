package com.coach.interview.service;

import com.coach.interview.model.InterviewSession;
import com.coach.interview.model.Question;
import com.coach.interview.model.User;
import com.coach.interview.repository.InterviewSessionRepository;
import com.coach.interview.repository.QuestionRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@SpringBootTest
public class InterviewServiceTest {

    @Autowired
    private InterviewService interviewService;

    @MockBean
    private QuestionRepository questionRepository;

    @MockBean
    private InterviewSessionRepository sessionRepository;

    @MockBean
    private OpenAIService openAIService;

    @Test
    public void testGetQuestions() {
        Question q1 = new Question("Question 1", "Technical", "Medium", "keywords", "answer");
        Mockito.when(questionRepository.findByCategoryAndDifficulty("Technical", "Medium"))
                .thenReturn(List.of(q1));

        List<Question> questions = interviewService.getQuestionsByCategoryAndDifficulty("Technical", "Medium");
        Assertions.assertEquals(1, questions.size());
        Assertions.assertEquals("Question 1", questions.get(0).getContent());
    }

    @Test
    public void testStartSession() {
        User user = new User("testuser", "password", "email", Set.of("ROLE_USER"));
        InterviewSession mockSession = new InterviewSession(user, "Technical", "Medium");
        mockSession.setId(10L);

        Mockito.when(sessionRepository.save(Mockito.any(InterviewSession.class)))
                .thenReturn(mockSession);

        InterviewSession session = interviewService.startSession(user, "Technical", "Medium");
        Assertions.assertNotNull(session);
        Assertions.assertEquals(10L, session.getId());
        Assertions.assertEquals("Technical", session.getCategory());
        Assertions.assertFalse(session.isCompleted());
    }

    @Test
    public void testSubmitSessionAnswers() {
        User user = new User("testuser", "password", "email", Set.of("ROLE_USER"));
        InterviewSession mockSession = new InterviewSession(user, "Technical", "Medium");
        mockSession.setId(10L);

        Mockito.when(sessionRepository.findById(10L))
                .thenReturn(Optional.of(mockSession));

        String qaTranscript = "[]";
        String mockOpenAIResponse = "{\"overallScore\": 85.0, \"clarityScore\": 80.0, \"confidenceScore\": 90.0, \"technicalScore\": 85.0, \"behaviorScore\": 82.0, \"feedback\": \"Good job.\", \"answers\": []}";

        Mockito.when(openAIService.evaluateInterview("Technical", "Medium", qaTranscript))
                .thenReturn(mockOpenAIResponse);

        Mockito.when(sessionRepository.save(Mockito.any(InterviewSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InterviewSession result = interviewService.submitSessionAnswers(10L, qaTranscript);
        Assertions.assertNotNull(result);
        Assertions.assertTrue(result.isCompleted());
        Assertions.assertEquals(85.0, result.getOverallScore());
        Assertions.assertEquals(80.0, result.getClarityScore());
        Assertions.assertEquals(90.0, result.getConfidenceScore());
    }
}
