package com.music.MusicPlayer.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_public")
    private boolean isPublic = false;

    // Many playlists can be owned by one listener
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Listener owner;

    // Many-to-many relationship with songs
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "playlist_songs",
            joinColumns = @JoinColumn(name = "playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @OrderColumn(name = "song_order")
    @JsonIgnore
    private List<Song> songs = new ArrayList<>();

    // Constructors
    public Playlist() {
        this.createdAt = LocalDateTime.now();
    }

    public Playlist(String name, Listener owner) {
        this();
        this.name = name;
        this.owner = owner;
    }

    public Playlist(String name, String description, Listener owner) {
        this();
        this.name = name;
        this.description = description;
        this.owner = owner;
    }

    // Methods to manage songs in playlist
    public void addSong(Song song) {
        if (!songs.contains(song)) {
            songs.add(song);
        }
    }

    public void removeSong(Song song) {
        songs.remove(song);
    }

    public boolean containsSong(Song song) {
        return songs.contains(song);
    }

    public void addSongAtIndex(Song song, int index) {
        if (!songs.contains(song)) {
            songs.add(index, song);
        }
    }

    public void clearSongs() {
        songs.clear();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Listener getOwner() {
        return owner;
    }

    public void setOwner(Listener owner) {
        this.owner = owner;
    }

    public List<Song> getSongs() {
        return songs;
    }

    public void setSongs(List<Song> songs) {
        this.songs = songs;
    }

    // Utility methods
    public int getSongCount() {
        return songs.size();
    }

    public long getTotalDuration() {
        return songs.stream().mapToLong(Song::getDuration).sum();
    }
}