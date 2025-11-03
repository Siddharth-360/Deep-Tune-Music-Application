package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Playlist;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Service.ListenerService;
import com.music.MusicPlayer.Service.PlaylistService;
import com.music.MusicPlayer.Service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/listener")
public class PlaylistController {

    @Autowired
    private ListenerService listenerService;

    @Autowired
    private PlaylistService playlistService;

    @Autowired
    private SongService songService;

    // Helper method to get current authenticated listener
    private Listener getCurrentListener() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        // Assuming your UserDetails service returns Listener object
        Object principal = authentication.getPrincipal();
        if (principal instanceof Listener) {
            return (Listener) principal;
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            // If you're using UserDetails, get the username and fetch the Listener
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return listenerService.findByEmail(username); // or findByUsername depending on your setup
        }
        return null;
    }

    // Get all playlists for the current listener (JSON endpoint for AJAX)
    @GetMapping("/playlists")
    @ResponseBody
    public ResponseEntity<?> getPlaylistsJson() {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            List<Playlist> playlists = listenerService.getListenerPlaylists(listener);

            // Convert to DTO for JSON response
            List<Map<String, Object>> playlistData = playlists.stream().map(playlist -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", playlist.getId());
                data.put("name", playlist.getName());
                data.put("description", playlist.getDescription());
                data.put("songCount", playlist.getSongs() != null ? playlist.getSongs().size() : 0);
                data.put("createdAt", playlist.getCreatedAt());
                return data;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(playlistData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // HTML page for playlists
    @GetMapping("/playlists/page")
    public String getPlaylistsPage(Model model) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return "redirect:/login";
        }

        List<Playlist> playlists = listenerService.getListenerPlaylists(listener);
        model.addAttribute("playlists", playlists);
        return "playlists";
    }

    // Create new playlist
    @PostMapping("/playlists/create")
    @ResponseBody
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> request) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        try {
            String name = request.get("name");
            String description = request.get("description");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Playlist name is required"));
            }

            Playlist playlist = listenerService.createPlaylistForListener(listener, name, description != null ? description : "");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("playlist", Map.of(
                    "id", playlist.getId(),
                    "name", playlist.getName(),
                    "description", playlist.getDescription()
            ));
            response.put("message", "Playlist created successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Like a song
    @PostMapping("/songs/{songId}/like")
    @ResponseBody
    public ResponseEntity<?> likeSong(@PathVariable String songId) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        try {
            Song song = songService.getSongById(songId);
            if (song == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song not found"));
            }

            listenerService.likeSong(listener, song);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song added to liked songs");
            response.put("liked", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Unlike a song
    @PostMapping("/songs/{songId}/unlike")
    @ResponseBody
    public ResponseEntity<?> unlikeSong(@PathVariable String songId) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        try {
            Song song = songService.getSongById(songId);
            if (song == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song not found"));
            }

            listenerService.unlikeSong(listener, song);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song removed from liked songs");
            response.put("liked", false);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Check if song is liked
    @GetMapping("/songs/{songId}/isLiked")
    @ResponseBody
    public ResponseEntity<?> isSongLiked(@PathVariable String songId) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Song song = songService.getSongById(songId);
            if (song == null) {
                return ResponseEntity.ok(Map.of("liked", false));
            }

            boolean isLiked = listenerService.isSongLiked(listener, song);

            Map<String, Object> response = new HashMap<>();
            response.put("liked", isLiked);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("liked", false);
            return ResponseEntity.ok(response);
        }
    }

    // Add song to playlist
    @PostMapping("/playlists/{playlistId}/addSong")
    @ResponseBody
    public ResponseEntity<?> addSongToPlaylist(@PathVariable Long playlistId, @RequestBody Map<String, String> request) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        try {
            String songId = request.get("songId");
            if (songId == null || songId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song ID is required"));
            }

            Song song = songService.getSongById(songId);
            if (song == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song not found"));
            }

            // Verify playlist belongs to listener
            Playlist playlist = playlistService.getPlaylistByIdAndOwner(playlistId, listener)
                    .orElseThrow(() -> new IllegalArgumentException("Playlist not found or access denied"));

            listenerService.addSongToListenerPlaylist(listener, playlistId, song);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song added to playlist");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Remove song from playlist
    @PostMapping("/playlists/{playlistId}/removeSong")
    @ResponseBody
    public ResponseEntity<?> removeSongFromPlaylist(@PathVariable Long playlistId, @RequestBody Map<String, String> request) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }

        try {
            String songId = request.get("songId");
            if (songId == null || songId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song ID is required"));
            }

            Song song = songService.getSongById(songId);
            if (song == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Song not found"));
            }

            // Verify playlist belongs to listener
            Playlist playlist = playlistService.getPlaylistByIdAndOwner(playlistId, listener)
                    .orElseThrow(() -> new IllegalArgumentException("Playlist not found or access denied"));

            listenerService.removeSongFromListenerPlaylist(listener, playlistId, song);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song removed from playlist");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get playlist details
    @GetMapping("/playlists/{playlistId}")
    public String getPlaylistDetails(@PathVariable Long playlistId, Model model) {
        Listener listener = getCurrentListener();
        if (listener == null) {
            return "redirect:/login";
        }

        try {
            Playlist playlist = playlistService.getPlaylistByIdAndOwner(playlistId, listener)
                    .orElseThrow(() -> new IllegalArgumentException("Playlist not found"));

            model.addAttribute("playlist", playlist);
            return "playlist-details";
        } catch (Exception e) {
            return "redirect:/listener/playlists/page";
        }
    }

    // In your PlaylistController
//    @GetMapping("/playlists/{playlistId}")
//    @ResponseBody
//    public ResponseEntity<?> getPlaylistDetails(@PathVariable Long playlistId, Principal principal) {
//        // Return playlist with songs
//    }
//
//    @PostMapping("/playlists/{playlistId}/remove-song")
//    @ResponseBody
//    public ResponseEntity<?> removeSongFromPlaylist(@PathVariable Long playlistId,
//                                                    @RequestBody Map<String, Long> request,
//                                                    Principal principal) {
//        // Remove song from playlist logic
//    }
}