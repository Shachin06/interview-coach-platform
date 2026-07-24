package com.coach.interview.repository;

import com.coach.interview.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryAndDifficulty(String category, String difficulty);
    List<Question> findByCategory(String category);
}
