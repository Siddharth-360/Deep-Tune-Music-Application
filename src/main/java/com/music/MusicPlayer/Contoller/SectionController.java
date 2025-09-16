package com.music.MusicPlayer.Contoller;


import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
    @RequestMapping("/api/sections")
    public class SectionController {

        @Autowired
        private ListenerService listenerService;

        @GetMapping("/profile")
        public String getProfileSection(Model model, Principal principal) {
            try {
                // Get the current user
                Listener listener = listenerService.getUser(principal.getName());
                model.addAttribute("listener", listener);

                // Return the fragment name
                return "/profile :: profileContent";
            } catch (Exception e) {
                // Log the error
                e.printStackTrace();
                return "/error :: errorContent";
            }
        }

        @GetMapping("/search")
        public String getSearchSection(Model model) {
            return "/search :: searchContent";
        }
//
//        @GetMapping("/library")
//        public String getLibrarySection(Model model, Principal principal) {
//            try {
//                Listener listener = listenerService.findByEmail(principal.getName());
//                // Add library data
//                model.addAttribute("playlists", listenerService.getUserPlaylists(listener.getId()));
//                model.addAttribute("savedTracks", listenerService.getSavedTracks(listener.getId()));
//                return "fragments/library :: libraryContent";
//            } catch (Exception e) {
//                e.printStackTrace();
//                return "fragments/error :: errorContent";
//            }
//        }
    }

