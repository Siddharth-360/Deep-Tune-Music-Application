package com.music.MusicPlayer.Service;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Playlist;
import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Repository.ListenerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.logging.Logger;

@Service
public class ListenerService {

    private static final Logger logger = Logger.getLogger(ListenerService.class.getName());

    @Autowired
    private ListenerRepository listenerRepository;

    @Autowired
    private PlaylistService playlistService;


    public Listener getUser(String email) {
        try {
            if (!StringUtils.hasText(email)) {
                logger.warning("Attempted to get user with null or empty email");
                return null;
            }
            return listenerRepository.findByEmail(email.trim().toLowerCase());
        } catch (Exception e) {
            logger.severe("Error getting user by email: " + email + " - " + e.getMessage());
            throw new RuntimeException("Error retrieving user", e);
        }
    }

    public Listener createListener(Listener listener) {
        try {
            if (listener == null) {
                throw new IllegalArgumentException("Listener cannot be null");
            }
            if (!StringUtils.hasText(listener.getEmail())) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }

            // Normalize email
            listener.setEmail(listener.getEmail().trim().toLowerCase());

            return listenerRepository.save(listener);
        } catch (Exception e) {
            logger.severe("Error creating listener: " + e.getMessage());
            throw new RuntimeException("Error creating user", e);
        }
    }

    public Listener updateListener(String email, String newName, String newProfilePhoto) {
        try {
            System.out.println("Updating listener: " + email);
            System.out.println("New name: " + newName);
            System.out.println("New profile photo: " + newProfilePhoto);

            Listener existingListener = listenerRepository.findByEmail(email);
            if (existingListener == null) {
                throw new RuntimeException("Listener not found: " + email);
            }

            boolean hasChanges = false;

            if (newName != null && !newName.trim().isEmpty() && !newName.equals(existingListener.getName())) {
                existingListener.setName(newName.trim());
                hasChanges = true;
                System.out.println("Name updated");
            }

            if (newProfilePhoto != null && !newProfilePhoto.trim().isEmpty() && !newProfilePhoto.equals(existingListener.getProfilePhoto())) {
                existingListener.setProfilePhoto(newProfilePhoto.trim());
                hasChanges = true;
                System.out.println("Profile photo updated");
            }

            if (hasChanges) {
                Listener updated = listenerRepository.save(existingListener);
                System.out.println("Changes saved successfully");
                return updated;
            } else {
                System.out.println("No changes detected");
                return existingListener;
            }

        } catch (Exception e) {
            logger.severe("Error in updateListener: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public boolean deleteListener(String email) {
        try {
            if (!StringUtils.hasText(email)) {
                logger.warning("Attempted to delete user with null or empty email");
                return false;
            }

            Listener listener = listenerRepository.findByEmail(email.trim().toLowerCase());
            if (listener != null) {
                listenerRepository.delete(listener);
                logger.info("Successfully deleted listener: " + email);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.severe("Error deleting listener: " + email + " - " + e.getMessage());
            throw new RuntimeException("Error deleting user", e);
        }
    }

    public void setRecentlyPlayedSong(String emial, Song song) {
        Listener listener = listenerRepository.findByEmail(emial);
        List<Song> li = listener.getRecentlyPlayed();
        li.add(song);
        listener.setRecentlyPlayed(li);
    }

    public List<Song> getRecentSong(String email) {
        Listener listener = listenerRepository.findByEmail(email);
        return listener.getRecentlyPlayed();
    }

    // Existing methods...

    // NEW: Like/Unlike song methods
    public void likeSong(Listener listener, Song song) {
        if (!listener.isLikedSong(song)) {
            listener.addLikedSong(song);
            listenerRepository.save(listener);
        }
    }

    public void unlikeSong(Listener listener, Song song) {
        if (listener.isLikedSong(song)) {
            listener.removeLikedSong(song);
            listenerRepository.save(listener);
        }
    }

    public boolean isSongLiked(Listener listener, Song song) {
        return listener.isLikedSong(song);
    }

    public List<Song> getLikedSongs(Listener listener) {
        return listener.getLikedSongs();
    }

    // Playlist management methods
    public Playlist createPlaylistForListener(Listener listener, String name, String description) {
        return playlistService.createPlaylist(name, description, listener);
    }

    public List<Playlist> getListenerPlaylists(Listener listener) {
        return playlistService.getPlaylistsByOwner(listener);
    }

    public void addSongToListenerPlaylist(Listener listener, Long playlistId, Song song) {
        playlistService.addSongToPlaylist(playlistId, song, listener);
    }

    public void removeSongFromListenerPlaylist(Listener listener, Long playlistId, Song song) {
        playlistService.removeSongFromPlaylist(playlistId, song, listener);
    }

    public Listener findByEmail(String username) {
        return listenerRepository.getByEmail(username);
    }

    public List<Song> getRecentlyPlayedSongs(Listener listener) {
        return listener.getRecentlyPlayed();
    }

    public int getLikedSongsCount(Listener listener) {
        return listener.getLikedSongs().size();
    }

    public int getPlaylistsCount(Listener listener) {
        return listener.getPlaylists().size();
    }

    public int getRecentTracksCount(Listener listener) {
        return listener.getRecentlyPlayed().size();
    }
}