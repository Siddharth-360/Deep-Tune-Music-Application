package com.music.MusicPlayer.Controller;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class PaymentController {

    @PostMapping("/user/payment")
    @ResponseBody
    public String payment(@RequestBody Map<String, Object> data) throws RazorpayException {
        System.out.println("Payment endpoint hit");

        // Extract amount from frontend (in rupees)
        Integer amountInRupees = (Integer) data.get("amount");
        if(amountInRupees == null){
            return "Amount is required";
        }

        // Convert to paise (Razorpay works with smallest currency unit)
        int amountInPaise = amountInRupees;

        // Initialize Razorpay client
        RazorpayClient client = new RazorpayClient("rzp_test_RL8etpXAZaTYH8", "a0seDyes4Wb9CV3v5b0fFq1v");

        // Create order request
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt#1");
        orderRequest.put("payment_capture", 1); // Auto capture payment

        // Create order
        Order order = client.orders.create(orderRequest);
        System.out.println(order);

        return order.toString();
    }
}
