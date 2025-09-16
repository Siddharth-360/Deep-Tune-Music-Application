package com.music.MusicPlayer.Contoller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/listner")
public class ListnerController {
    @Autowired
    private ListenerService listenerService;

   @GetMapping("/get/{email}")
       public Listener getuser(@PathVariable String email){
      return listenerService.getUser(email);
   }

//   @GetMapping("/getSong/{email}")
//   public List<Song> getSong(@PathVariable String email){
//       return listnerService.GetSong(email);
//   }

    @PostMapping("/save")
    public String saveuser(@ModelAttribute Listener listener){
        listener.setProfilePhoto("/Pictures/UserDefault.png");
        listenerService.createListener(listener);
        return "redirect:/login";
    }




}
