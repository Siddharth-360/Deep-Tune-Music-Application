package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Playlist;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Repositories.PlaylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    public List<Playlist> getPlaylistsByOwner(Listener owner) {
        return playlistRepository.findByOwner(owner);
    }

    public Optional<Playlist> getPlaylistByIdAndOwner(Long id, Listener owner) {
        return playlistRepository.findByIdAndOwner(id, owner);
    }

    public Playlist createPlaylist(String name, String description, Listener owner) {
        if (playlistRepository.existsByNameAndOwner(name, owner)) {
            throw new IllegalArgumentException("Playlist with name '" + name + "' already exists");
        }

        Playlist playlist = new Playlist(name, description, owner);
        return playlistRepository.save(playlist);
    }

    public Playlist updatePlaylist(Long playlistId, String name, String description, Boolean isPublic, Listener owner) {
        Optional<Playlist> optionalPlaylist = playlistRepository.findByIdAndOwner(playlistId, owner);
        if (optionalPlaylist.isPresent()) {
            Playlist playlist = optionalPlaylist.get();

            if (name != null && !name.trim().isEmpty() && !name.equals(playlist.getName())) {
                if (playlistRepository.existsByNameAndOwner(name, owner)) {
                    throw new IllegalArgumentException("Playlist with name '" + name + "' already exists");
                }
                playlist.setName(name);
            }

            if (description != null) {
                playlist.setDescription(description);
            }

            if (isPublic != null) {
                playlist.setPublic(isPublic);
            }

            return playlistRepository.save(playlist);
        }
        throw new IllegalArgumentException("Playlist not found");
    }

    public void deletePlaylist(Long playlistId, Listener owner) {
        Optional<Playlist> optionalPlaylist = playlistRepository.findByIdAndOwner(playlistId, owner);
        if (optionalPlaylist.isPresent()) {
            playlistRepository.delete(optionalPlaylist.get());
        } else {
            throw new IllegalArgumentException("Playlist not found");
        }
    }

    public Playlist addSongToPlaylist(Long playlistId, Song song, Listener owner) {
        Optional<Playlist> optionalPlaylist = playlistRepository.findByIdAndOwner(playlistId, owner);
        if (optionalPlaylist.isPresent()) {
            Playlist playlist = optionalPlaylist.get();
            playlist.addSong(song);
            return playlistRepository.save(playlist);
        }
        throw new IllegalArgumentException("Playlist not found");
    }

    public Playlist removeSongFromPlaylist(Long playlistId, Song song, Listener owner) {
        Optional<Playlist> optionalPlaylist = playlistRepository.findByIdAndOwner(playlistId, owner);
        if (optionalPlaylist.isPresent()) {
            Playlist playlist = optionalPlaylist.get();
            playlist.removeSong(song);
            return playlistRepository.save(playlist);
        }
        throw new IllegalArgumentException("Playlist not found");
    }

    public List<Playlist> searchPlaylists(String query, Listener owner) {
        return playlistRepository.findByOwnerAndNameContainingIgnoreCase(owner, query);
    }
}