package com.coach.interview.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CacheService {

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    private final Map<String, Object> localCache = new ConcurrentHashMap<>();

    public void put(String key, Object value) {
        if (redisHost != null && !redisHost.trim().isEmpty() && !redisHost.equals("localhost")) {
            putInRedis(key, value);
        } else {
            localCache.put(key, value);
        }
    }

    public Object get(String key) {
        if (redisHost != null && !redisHost.trim().isEmpty() && !redisHost.equals("localhost")) {
            return getFromRedis(key);
        } else {
            return localCache.get(key);
        }
    }

    public void remove(String key) {
        if (redisHost != null && !redisHost.trim().isEmpty() && !redisHost.equals("localhost")) {
            removeFromRedis(key);
        } else {
            localCache.remove(key);
        }
    }

    private void putInRedis(String key, Object value) {
        // Redis client placeholder logic
        System.out.println("Caching in Redis: Key=" + key);
        localCache.put(key, value);
    }

    private Object getFromRedis(String key) {
        // Redis client placeholder logic
        return localCache.get(key);
    }

    private void removeFromRedis(String key) {
        // Redis client placeholder logic
        localCache.remove(key);
    }
}
