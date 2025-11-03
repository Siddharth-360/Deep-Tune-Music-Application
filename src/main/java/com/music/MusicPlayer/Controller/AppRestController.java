package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Service.EmailService;
import com.music.MusicPlayer.Service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AppRestController {
    @Autowired
    EmailService emailService;
    @Autowired
    OtpService otpService;

    @PostMapping("/getotp")
    public ResponseEntity<Map<String,Object>> sendOtp(@RequestParam String email){
         Map<String,Object> response = new HashMap<>();
        try{
            int otp = 100000 + (int)(Math.random() * 900000);
            emailService.sendSimpleEmail(email,"Otp for Email Verification",String.valueOf(otp));
            otpService.storeOtp(email,String.valueOf(otp));
           response.put("success","true");
           response.put("message","Otp sent Sucessfully!!");
           return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success","false");
            response.put("message","Failed to send Otp!!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verifyotp")
    public ResponseEntity<Map<String,String>> verifyOtp(@RequestParam String email,@RequestParam String otp){
         Map<String, String> response = new HashMap<>();
        try{
            if (otpService.verifyOTP(email, otp)) {
                response.put("success", "true");
                response.put("message", "OTP verified successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", "false");
                response.put("message", "Invalid OTP");
                System.out.println("Error in cache");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        }catch(Exception e){
            response.put("success","false");
            response.put("message","Invalid Otp");
            System.out.println("Error in logic");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
