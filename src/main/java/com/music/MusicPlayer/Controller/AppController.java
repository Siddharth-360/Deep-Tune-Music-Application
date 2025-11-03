package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller

public class AppController {

    @Autowired
    private SongRestController songRestController;

    @Autowired
    private ListenerService listenerService;

    @GetMapping("/register")
    public String register(){
        return "register";
    }
    @GetMapping("/login")
    public String login(){
        return "login";
    }

    @GetMapping("/home")
        public String home(){
        return "home";
    }

//    @GetMapping("/sections/profile")
//    public String showProfilePage(Model model, Principal principal) {
//        // Get current user
//        String username = principal.getName();
//        Listener listener = listenerService.getUser(username);
//
//        // Add listener data to model
//        model.addAttribute("listener", listener);
//        model.addAttribute("likedSongs", listener.getLikedSongs());
//        model.addAttribute("recentlyPlayed", listener.getRecentlyPlayed());
//
//        return "profile :: profile-content";
//    }




}
