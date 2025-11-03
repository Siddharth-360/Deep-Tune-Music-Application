package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Models.SongDTO;
import com.music.MusicPlayer.Models.Track;
import com.music.MusicPlayer.Repository.TrackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/songs")
public class SongSearchController {
    @Autowired
private TrackRepository songRepository;



    @GetMapping("/search")
    public ResponseEntity<List<SongDTO>> searchSongs(@RequestParam String query) {
        System.out.println("search End point hit");
        try {
            if (query == null || query.trim().length() < 2) {
                return ResponseEntity.badRequest().build();
            }

            // Search in both title and artist fields
            List<Track> songs = songRepository.searchByTitleOrArtist(query.trim());
            if(songs.size()==0){
                System.out.println("No song found");
            }
            // Convert to DTO
            List<SongDTO> songDTOs = songs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(songDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private SongDTO convertToDTO(Track song) {
        SongDTO dto = new SongDTO();
        dto.setSongId(song.getSongId());
        dto.setTitle(song.getTitle());
        dto.setArtist(song.getArtist());
        dto.setImageUrl(song.getImageUrl());
        dto.setPreviewUrl(song.getPreviewUrl());
        return dto;
    }
}

// DTO Class
