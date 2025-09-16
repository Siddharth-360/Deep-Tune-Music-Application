package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Repository.ListenerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService
{
    @Autowired
    private ListenerRepository listenerRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Listener client  = listenerRepository.getByEmail(email);
        if(client!=null){
            return User.builder().username(client.getEmail()).password(client.getPassword()).build();
        }
        throw new UsernameNotFoundException("User not found!");
    }
}

