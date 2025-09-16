package com.music.MusicPlayer.Models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listeners")
public class Listener {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(unique = true, nullable = false)
    @JsonProperty("email")
    private String email;

    @Column(nullable = false)
    @JsonProperty("name")
    private String name;

    @JsonProperty("password")
    private String password;

    @Column(name = "is_premium")
    private boolean isPremium = false;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "listener_liked_songs",
            joinColumns = @JoinColumn(name = "listener_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    private List<Song> likedSongs = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "listener_recently_played",
            joinColumns = @JoinColumn(name = "listener_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @OrderColumn(name = "play_order") // This maintains the order in the database
    private List<Song> recentlyPlayed = new ArrayList<>();

    // Maximum number of recently played songs to store
    private static final int MAX_RECENTLY_PLAYED = 10;

    // Constructors
    public Listener() {
    }

    public Listener(String email, String name, String password) {
        this.email = email;
        this.name = name;
        this.password = password;
    }

    // Method to add a song to recently played
    public void addToRecentlyPlayed(Song song) {
        // Remove the song if it already exists in the list
        recentlyPlayed.remove(song);

        // Add the song to the beginning of the list
        recentlyPlayed.add(0, song);

        // Keep only the last 10 songs
        if (recentlyPlayed.size() > MAX_RECENTLY_PLAYED) {
            recentlyPlayed = new ArrayList<>(recentlyPlayed.subList(0, MAX_RECENTLY_PLAYED));
        }
    }


    // Method to clear recently played songs
    public void clearRecentlyPlayed() {
        recentlyPlayed.clear();
    }

    // Method to check if a song was recently played
    public boolean wasRecentlyPlayed(Song song) {
        return recentlyPlayed.contains(song);
    }

    // Get the most recently played song
    public Song getMostRecentlyPlayed() {
        return recentlyPlayed.isEmpty() ? null : recentlyPlayed.get(0);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isPremium() {
        return isPremium;
    }

    public void setPremium(boolean premium) {
        isPremium = premium;
    }

    public List<Song> getLikedSongs() {
        return likedSongs;
    }

    public void setLikedSongs(List<Song> likedSongs) {
        this.likedSongs = likedSongs;
    }

    public List<Song> getRecentlyPlayed() {
        return recentlyPlayed;
    }

    public void setRecentlyPlayed(List<Song> recentlyPlayed) {
        this.recentlyPlayed = recentlyPlayed;
        // Ensure we don't exceed the limit even when setting directly
        if (this.recentlyPlayed.size() > MAX_RECENTLY_PLAYED) {
            this.recentlyPlayed = new ArrayList<>(this.recentlyPlayed.subList(0, MAX_RECENTLY_PLAYED));
        }
    }

    // Helper methods for liked songs
    public void addLikedSong(Song song) {
        if (!likedSongs.contains(song)) {
            likedSongs.add(song);
        }
    }

    public void removeLikedSong(Song song) {
        likedSongs.remove(song);
    }

    public boolean isLikedSong(Song song) {
        return likedSongs.contains(song);
    }
}