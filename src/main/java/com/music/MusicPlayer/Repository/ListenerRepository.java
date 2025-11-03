package com.music.MusicPlayer.Repository;

import com.music.MusicPlayer.Models.Listener;
import org.springframework.data.jpa.repository.JpaRepository;

public  interface ListenerRepository extends JpaRepository<Listener,Long> {
    @Override
    Listener getById(Long id);


    Listener getByEmail(String email);

    Listener findByEmail(String email);
}
