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
}