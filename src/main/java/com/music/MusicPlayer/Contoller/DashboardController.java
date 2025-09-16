package com.music.MusicPlayer.Contoller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Models.Track;
import com.music.MusicPlayer.Service.ListenerService;
import com.music.MusicPlayer.Service.TrackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;

@Controller
public class DashboardController {

    @Autowired
    private ListenerService listenerService;

    @Autowired
    private TrackService trackService;

    @GetMapping("/dashboard")
    public String dashboard(Model model, Principal principal) {
        // Get current user email from authentication
        String email = principal.getName();

        // Get listener details
        Listener listener = listenerService.getUser(email);

        // Get all tracks for trending section
        List<Track> trendingTracks = trackService.getTrack();
        List<Song> recentlyPlayed = listenerService.getRecentSong(email);
        // Add to model
        model.addAttribute("listener", listener);
        model.addAttribute("trendingTracks", trendingTracks);
        model.addAttribute("recentlyPlayed", recentlyPlayed);

        return "dashboard";
    }
}