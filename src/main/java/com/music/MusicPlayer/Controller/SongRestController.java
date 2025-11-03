package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Service.ApiService;
import com.music.MusicPlayer.Service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
