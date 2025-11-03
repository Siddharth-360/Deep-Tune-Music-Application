package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Playlist;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Models.SongDTO;
import com.music.MusicPlayer.Service.ListenerService;
import com.music.MusicPlayer.Service.PlaylistService;
import com.music.MusicPlayer.Service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/listener")
public class LibraryController {

    @Autowired
    private ListenerService listenerService;

    @Autowired
    private PlaylistService playlistService;

    @Autowired
    private SongService songService;

    // Get liked songs (AJAX)
    @GetMapping("/library/liked-songs")
    @ResponseBody
    public ResponseEntity<?> getLikedSongs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        System.out.println("liked endpoint hit");
        try {
            Listener listener = listenerService.findByEmail(principal.getName());
            List<Song> likedSongs = listenerService.getLikedSongs(listener);

            // Convert to DTOs to avoid circular references
            List<SongDTO> songsData = likedSongs.stream().map(song -> {
                SongDTO dto = new SongDTO();
                dto.setSongId(song.getId());
                dto.setTitle(song.getTitle());
                dto.setArtist(song.getArtist());
                dto.setDuration(song.getDuration());
                dto.setImageUrl(song.getImageUrl());
                dto.setPreviewUrl(song.getPreviewUrl());
                dto.setLiked(true);
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("songs", songsData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // Get user playlists (AJAX)
    @GetMapping("/library/playlists")
    @ResponseBody
    public ResponseEntity<?> getUserPlaylists(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Listener listener = listenerService.findByEmail(principal.getName());
            List<Playlist> playlists = listenerService.getListenerPlaylists(listener);

            List<Map<String, Object>> playlistsData = playlists.stream().map(playlist -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", playlist.getId());
                data.put("name", playlist.getName());
                data.put("description", playlist.getDescription());
                data.put("songCount", playlist.getSongs() != null ? playlist.getSongs().size() : 0);
                data.put("createdAt", playlist.getCreatedAt());
                return data;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("playlists", playlistsData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get recently played songs (AJAX)
    @GetMapping("/library/recently-played")
    @ResponseBody
    public ResponseEntity<?> getRecentlyPlayed(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Listener listener = listenerService.findByEmail(principal.getName());
            List<Song> recentSongs = listenerService.getRecentlyPlayedSongs(listener);

            List<Map<String, Object>> songsData = recentSongs.stream().map(song -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", song.getId());
                data.put("title", song.getTitle());
                data.put("artist", song.getArtist());
                data.put("duration", song.getDuration());
                data.put("imageUrl", song.getImageUrl());
                data.put("previewUrl", song.getPreviewUrl());
                return data;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("songs", songsData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}