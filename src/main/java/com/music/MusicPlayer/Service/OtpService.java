package com.music.MusicPlayer.Service;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import org.apache.catalina.webresources.Cache;
import org.springframework.boot.autoconfigure.cache.CacheProperties;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class OtpService {
    private static final LoadingCache<String, String> cache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build(k -> null);

    public void storeOtp(String email, String otp){
        cache.put(email,otp);
    }

    public  boolean verifyOTP(String email, String userEnteredOTP) {
        String cachedOTP = cache.get(email);
        return userEnteredOTP != null && userEnteredOTP.equals(cachedOTP);
    }

    public static void clearOTP(String email) {
        cache.invalidate(email);
    }


}
