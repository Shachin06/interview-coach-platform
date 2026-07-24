package com.coach.interview.service;

import com.coach.interview.model.InterviewSession;
import com.coach.interview.model.Question;
import com.coach.interview.model.User;
import com.coach.interview.repository.InterviewSessionRepository;
import com.coach.interview.repository.QuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private OpenAIService openAIService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void seedQuestions() {
        if (questionRepository.count() == 0) {
            // Software Engineering Questions
            questionRepository.save(new Question(
                    "What is the difference between an Abstract Class and an Interface in Java?",
                    "Software Engineering", "Easy",
                    "abstract class, interface, multiple inheritance, default methods, implementation",
                    "An abstract class can have state (instance variables) and constructors, and supports single inheritance. An interface defines a contract, supports multiple inheritance, and can have default/static methods in Java 8+."
            ));
            questionRepository.save(new Question(
                    "Explain how a HashMap works under the hood in Java.",
                    "Software Engineering", "Medium",
                    "hashcode, equals, bucket, array, treeify, linked list, collision",
                    "HashMap uses hashing to map keys to bucket indices in an array. In case of collisions, it stores entries in a LinkedList. If bucket sizes exceed 8, it treeifies the bucket into a Red-Black Tree."
            ));
            questionRepository.save(new Question(
                    "How does garbage collection work in Java?",
                    "Software Engineering", "Hard",
                    "garbage collection, heap, generational, mark-sweep, stop-the-world, young generation, old generation",
                    "Java GC uses generational garbage collection where younger objects are in the Eden space and promoted to Old Generation. It performs mark-sweep on objects with no references and uses stop-the-world pauses."
            ));
            questionRepository.save(new Question(
                    "What are the SOLID principles and how do you apply them?",
                    "Software Engineering", "Medium",
                    "SOLID, single responsibility, open-closed, Liskov substitution, interface segregation, dependency inversion",
                    "SOLID principles are: Single Responsibility - each class does one thing; Open/Closed - open for extension, closed for modification; Liskov Substitution - subtypes should replace base types; Interface Segregation - clients depend on specific interfaces; Dependency Inversion - depend on abstractions, not concrete implementations."
            ));
            questionRepository.save(new Question(
                    "Explain the difference between REST and GraphQL.",
                    "Software Engineering", "Medium",
                    "REST, GraphQL, endpoints, queries, over-fetching, under-fetching, schema",
                    "REST uses multiple endpoints and returns fixed data structures. GraphQL uses a single endpoint with flexible queries where clients request only needed fields, avoiding over-fetching and under-fetching."
            ));
            
            // Behavioral Questions
            questionRepository.save(new Question(
                    "Describe a time you had a conflict with a coworker and how you resolved it.",
                    "Behavioral", "Medium",
                    "conflict, resolution, communication, empathy, compromise, feedback",
                    "I had a disagreement about database indexing schema. I scheduled a 1-on-1 to listen to their performance concerns, presented benchmarks, and reached a compromise that combined both architectures."
            ));
            questionRepository.save(new Question(
                    "Tell me about a time you failed and what you learned from it.",
                    "Behavioral", "Easy",
                    "failure, learning, growth, accountability, problem-solving, resilience",
                    "In my early career, I missed a critical deadline because I underestimated task complexity. I learned to break down work into smaller milestones, communicate progress transparently, and ask for help when needed."
            ));
            questionRepository.save(new Question(
                    "How do you prioritize when you have multiple urgent tasks?",
                    "Behavioral", "Medium",
                    "prioritization, urgency, impact, stakeholder management, time management, decision-making",
                    "I assess impact and urgency using a matrix. I communicate with stakeholders about realistic deadlines, break work into parallel streams, and focus on high-impact items first while maintaining quality."
            ));
            
            // System Design Questions
            questionRepository.save(new Question(
                    "How would you design a scalable notification system like the one used by Netflix?",
                    "System Design", "Hard",
                    "pub-sub, rate limiter, queue, kafka, microservices, push notifications, reliability",
                    "I would build a service with a Rate Limiter to prevent spam, a Message Queue (like Kafka or RabbitMQ) for decoupling, notification templates, and third-party integrations (APNS, FCM) with retry logic."
            ));
            questionRepository.save(new Question(
                    "Design a distributed cache system for a high-traffic e-commerce platform.",
                    "System Design", "Hard",
                    "caching, distributed systems, Redis, invalidation, TTL, consistency, sharding",
                    "Use Redis with consistent hashing for sharding. Implement cache-aside pattern with TTL. Add event-driven invalidation for updates. Use read replicas for resilience and monitor hit rates."
            ));
            
            // Product Management Questions
            questionRepository.save(new Question(
                    "How would you measure the success of a new feature for Instagram Stories?",
                    "Product Management", "Medium",
                    "metrics, DAU, retention, engagement, adoption, conversion",
                    "Success can be measured by tracking Adoption Rate (users who tried it), Engagement (stories posted/views), Retention (re-use over 7 days), and business goals like user session duration."
            ));
            
            // DevOps Engineer Questions
            questionRepository.save(new Question(
                    "Explain your approach to infrastructure as code (IaC) and what tools you prefer.",
                    "DevOps", "Medium",
                    "infrastructure as code, Terraform, CloudFormation, Ansible, version control, reproducibility",
                    "IaC allows reproducible infrastructure deployment. I prefer Terraform for cloud-agnostic provisioning, store all code in Git, use CI/CD to validate changes, and implement approval workflows for production."
            ));
            questionRepository.save(new Question(
                    "How do you approach deployment rollbacks and disaster recovery?",
                    "DevOps", "Medium",
                    "rollback, disaster recovery, backup, RTO, RPO, blue-green deployment, canary releases",
                    "Use blue-green deployments for zero-downtime rollbacks. Maintain backups with defined RTO/RPO. Implement automated health checks to trigger rollbacks. Use canary releases for gradual deployments to catch issues early."
            ));
            questionRepository.save(new Question(
                    "Describe a production incident you handled and how you prevented it from happening again.",
                    "DevOps", "Hard",
                    "incident management, monitoring, alerting, post-mortem, root cause analysis, prevention",
                    "A database connection pool exhaustion caused service outage. I implemented connection pool monitoring, set up alerts before exhaustion, added circuit breakers, and automated scaling based on queue depth."
            ));
            
            // Security Engineer Questions
            questionRepository.save(new Question(
                    "How would you approach implementing a secure authentication system?",
                    "Security", "Medium",
                    "authentication, OAuth, JWT, password hashing, MFA, encryption, session management",
                    "Use OAuth 2.0 for third-party auth, JWT with short expiration for tokens, bcrypt for password hashing, implement MFA for sensitive accounts, enforce HTTPS, and use secure session cookies with SameSite attributes."
            ));
            questionRepository.save(new Question(
                    "Explain the difference between encryption and hashing, and when to use each.",
                    "Security", "Easy",
                    "encryption, hashing, reversible, one-way, salt, cipher, plaintext, ciphertext",
                    "Encryption is reversible (AES-256 for data at rest/transit). Hashing is one-way, used for passwords with salt. Encryption protects sensitive data that needs retrieval; hashing protects passwords for verification only."
            ));
            questionRepository.save(new Question(
                    "How do you manage and rotate API keys securely in a microservices environment?",
                    "Security", "Hard",
                    "API keys, rotation, secrets management, vault, access control, audit trails, zero-downtime",
                    "Use a secrets management vault (HashiCorp Vault, AWS Secrets Manager). Implement automated rotation with versioning. Deploy new keys without stopping services. Audit all access and immediately revoke compromised keys."
            ));
            
            // Frontend Engineer Questions
            questionRepository.save(new Question(
                    "Explain the React Virtual DOM and how it improves performance.",
                    "Frontend", "Medium",
                    "Virtual DOM, reconciliation, diffing, fiber architecture, re-render optimization, batching",
                    "React uses a Virtual DOM to create an in-memory representation of the actual DOM. It performs diffing to identify changes and applies only those updates to the real DOM, reducing expensive DOM operations and improving performance."
            ));
            questionRepository.save(new Question(
                    "What is the difference between state and props in React?",
                    "Frontend", "Easy",
                    "state, props, mutable, immutable, component hierarchy, data flow, lifecycle",
                    "Props are immutable inputs passed from parent to child components. State is mutable data managed within a component. Props create one-way data flow; state is internal to a component and triggers re-renders when changed."
            ));
            questionRepository.save(new Question(
                    "How would you optimize a large React application for performance?",
                    "Frontend", "Hard",
                    "code splitting, lazy loading, memoization, useMemo, useCallback, bundling, tree shaking, profiling",
                    "Use code splitting with dynamic imports, lazy load components, memoize expensive calculations with useMemo, implement useCallback to prevent unnecessary re-renders, optimize bundle size, and use React DevTools Profiler to identify bottlenecks."
            ));
            
            // Data Science Questions
            questionRepository.save(new Question(
                    "Explain the bias-variance tradeoff in machine learning.",
                    "Data Science", "Medium",
                    "bias, variance, overfitting, underfitting, model complexity, training error, test error, regularization",
                    "Bias is error from oversimplified models; variance is error from model sensitivity to data. High bias = underfitting, high variance = overfitting. The tradeoff requires finding the right model complexity using cross-validation and regularization."
            ));
            questionRepository.save(new Question(
                    "What is feature engineering and why is it important?",
                    "Data Science", "Easy",
                    "feature engineering, feature selection, normalization, encoding, domain knowledge, feature importance",
                    "Feature engineering is creating meaningful features from raw data. It's crucial because good features enable models to learn patterns better. Techniques include scaling, encoding categorical variables, polynomial features, and domain-specific transformations."
            ));
            questionRepository.save(new Question(
                    "How do you prevent overfitting in machine learning models?",
                    "Data Science", "Hard",
                    "overfitting, regularization, L1/L2, cross-validation, dropout, early stopping, data augmentation, ensemble methods",
                    "Use L1/L2 regularization to penalize complex models, implement cross-validation, add dropout for neural networks, use early stopping to halt training before overfitting, increase training data, and leverage ensemble methods like bagging and boosting."
            ));
        }
    }

    public List<Question> getQuestionsByCategoryAndDifficulty(String category, String difficulty) {
        if (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("All")) {
            return questionRepository.findAll();
        }
        return questionRepository.findByCategoryAndDifficulty(category, difficulty);
    }

    public InterviewSession startSession(User user, String category, String difficulty) {
        InterviewSession session = new InterviewSession(user, category, difficulty);
        return sessionRepository.save(session);
    }

    public List<InterviewSession> getUserSessions(User user) {
        return sessionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<InterviewSession> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public InterviewSession submitSessionAnswers(Long sessionId, String qaTranscriptJson) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Call OpenAI to evaluate
        String evaluationJson = openAIService.evaluateInterview(
                session.getCategory(), 
                session.getDifficulty(), 
                qaTranscriptJson
        );

        try {
            JsonNode rootNode = objectMapper.readTree(evaluationJson);
            session.setOverallScore(rootNode.path("overallScore").asDouble(70.0));
            session.setClarityScore(rootNode.path("clarityScore").asDouble(70.0));
            session.setConfidenceScore(rootNode.path("confidenceScore").asDouble(70.0));
            session.setTechnicalScore(rootNode.path("technicalScore").asDouble(70.0));
            session.setBehaviorScore(rootNode.path("behaviorScore").asDouble(70.0));
            session.setTranscriptJson(evaluationJson);
            session.setCompleted(true);
            
            return sessionRepository.save(session);
        } catch (Exception e) {
            // Fallback if parsing fails
            session.setOverallScore(75);
            session.setClarityScore(75);
            session.setConfidenceScore(75);
            session.setTechnicalScore(75);
            session.setBehaviorScore(75);
            session.setTranscriptJson(evaluationJson);
            session.setCompleted(true);
            return sessionRepository.save(session);
        }
    }

    public void updateVideoPath(Long sessionId, String videoPath) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        session.setVideoPath(videoPath);
        sessionRepository.save(session);
    }
}
