package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/sections")
public class SectionController {

    @Autowired
    private ListenerService listenerService;

    @GetMapping("/profile")
    public String getProfileSection(Model model, Principal principal) {
        System.out.println("profile section hit");
        try {
            if (principal == null) {
                return "error :: errorContent";
            }

            // Get the current user
            Listener listener = listenerService.getUser(principal.getName());
            if (listener == null) {
                return "error :: errorContent";
            }

            model.addAttribute("listener", listener);
            return "profile :: profileContent"; // Removed leading slash
        } catch (Exception e) {
            e.printStackTrace();
            return "error :: errorContent"; // Removed leading slash
        }
    }

    @GetMapping("/search")
    public String getSearchSection(Model model, Principal principal) {
        System.out.println("search section hit");
        try {
            if (principal == null) {
                return "error :: errorContent";
            }

            // Verify user exists
            Listener listener = listenerService.getUser(principal.getName());
            if (listener == null) {
                return "error :: errorContent";
            }

            return "search :: searchContent";// Removed leading slash
        } catch (Exception e) {
            e.printStackTrace();
            return "error :: errorContent"; // Removed leading slash
        }
    }

    @GetMapping("/library")
    public String getLibrarySection(Model model, Principal principal) {
        System.out.println("Library section hit");
        try {
            if (principal == null) {
                System.out.println("No principal found");
                return "error :: errorContent";
            }

            // Get the current user
            Listener listener = listenerService.getUser(principal.getName());
            if (listener == null) {
                System.out.println("Listener not found for: " + principal.getName());
                return "error :: errorContent";
            }

            System.out.println("Processing library for user: " + listener.getName());

            // Get counts for stats
            int likedSongsCount = listenerService.getLikedSongsCount(listener);
            int playlistsCount = listenerService.getPlaylistsCount(listener);
            int recentTracksCount = listenerService.getRecentTracksCount(listener);

            System.out.println("Library counts - Liked: " + likedSongsCount +
                    ", Playlists: " + playlistsCount +
                    ", Recent: " + recentTracksCount);

            model.addAttribute("likedSongsCount", likedSongsCount);
            model.addAttribute("playlistsCount", playlistsCount);
            model.addAttribute("recentTracksCount", recentTracksCount);

            return "library :: libraryContent"; // Removed leading slash
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error in library section: " + e.getMessage());
            return "error :: errorContent"; // Removed leading slash
        }
    }
}