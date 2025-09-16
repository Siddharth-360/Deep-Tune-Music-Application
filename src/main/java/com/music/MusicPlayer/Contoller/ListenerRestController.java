package com.music.MusicPlayer.Contoller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/listener")
public class ListenerRestController {
    @Autowired
    ListenerService listenerService;
    @PostMapping("/setRecentlyPlayed")
    public ResponseEntity<String> setRecentlyPlayed(@RequestBody Song song,Principal principal){
         listenerService.setRecentlyPlayedSong(principal.getName(),song);
         return new ResponseEntity<>("added sucessfully",HttpStatus.OK);
    }
}
