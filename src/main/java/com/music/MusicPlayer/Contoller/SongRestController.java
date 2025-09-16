package com.music.MusicPlayer.Contoller;

import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Models.Track;
import com.music.MusicPlayer.Service.ApiService;
import com.music.MusicPlayer.Service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/song")
public class SongRestController {
    @Autowired
    private SongService songService;

      @Autowired
    private ApiService apiService;

    @GetMapping("/search")
    public void  searchTracks() {
       apiService.searchTracks();
    }

}
