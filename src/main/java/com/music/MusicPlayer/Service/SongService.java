package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Repository.ListenerRepository;
import com.music.MusicPlayer.Repository.SongRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Slf4j
@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private ListenerRepository listenerRepository;


    public void saveSong(Song song) {
     if(songRepository.existsBySongId(song.getSongId())){
         songRepository.save(song);
     }

    }

    public Song getSongById(String songId) {
        try {
            Long num = Long.valueOf(songId);
            // Use findById or findBySongId instead of existsBySongId
            return songRepository.findById(num)
                    .orElseThrow(() -> new IllegalArgumentException("Song not found with ID: " + songId));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid song ID format: " + songId);
        }
    }
}