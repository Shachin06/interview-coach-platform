package com.coach.interview.repository;

import com.coach.interview.model.InterviewSession;
import com.coach.interview.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserOrderByCreatedAtDesc(User user);
}
