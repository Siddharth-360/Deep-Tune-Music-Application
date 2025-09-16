package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Repository.ListenerRepository;
import com.music.MusicPlayer.Repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ListenerService {
    @Autowired
    private ListenerRepository listenerRepository;

    @Autowired
    private SongRepository songRepository;

    public Listener getUser(String email) {
        return listenerRepository.getByEmail(email);
    }

    public void createListener(Listener listener) {
        System.out.println("creating user");
        listenerRepository.save(listener);
    }

    @Transactional
    public void setRecentlyPlayedSong(String email, Song song) {
        // Find listener
        Listener listener = listenerRepository.getByEmail(email);
        if (listener == null) {
            throw new RuntimeException("User not found");
        }

        Song songToAdd = songRepository.findBySongId(song.getSongId())
                .orElseGet(() -> {
                    // Only create new song if it doesn't exist
                    Song newSong = new Song();
                    newSong.setSongId(song.getSongId());
                    newSong.setTitle(song.getTitle());
                    newSong.setArtist(song.getArtist());
                    newSong.setImageUrl(song.getImageUrl());
                    newSong.setPreviewUrl(song.getPreviewUrl());
                    return songRepository.save(newSong);
                });

        // Add to recently played (will handle duplicates in Listener entity)
        listener.addToRecentlyPlayed(songToAdd);
        listenerRepository.save(listener);
    }

    public List<Song> getLikedSong(String email) {
        Listener listener = listenerRepository.getByEmail(email);
        return listener != null ? listener.getLikedSongs() : List.of();
    }

    public List<Song> getRecentSong(String email) {
        Listener listener = listenerRepository.getByEmail(email);
        return listener != null ? listener.getRecentlyPlayed() : List.of();
    }
}