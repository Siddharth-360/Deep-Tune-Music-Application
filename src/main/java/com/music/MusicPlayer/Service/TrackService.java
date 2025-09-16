package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Track;
import com.music.MusicPlayer.Repository.TrackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackService {
    @Autowired
    TrackRepository trackRepository;

    public void saveTrack(Track t1){
         if(!trackRepository.existsBySongId(t1.getSongId())){
             trackRepository.save(t1);
         }else{
             System.out.println("Song already Exist");
         }

    }

    public List<Track> getTrack(){
        return trackRepository.findAll();
    }
}
