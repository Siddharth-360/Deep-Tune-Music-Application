package com.music.MusicPlayer.Models;

import jakarta.persistence.*;

@Entity
@Table(
        name = "track",
        uniqueConstraints = @UniqueConstraint(columnNames = "song_id")
)
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private long songId;
    private String title;
    private String artist;
    private String imageUrl;
    private String previewUrl;

    // Constructor
    public Track(long songId,String title, String artist, String imageUrl, String previewUrl) {
        this.songId  = songId;
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
        this.previewUrl = previewUrl;
    }

    public Track(){
    }
    public long getSongId() {
        return songId;
    }

    public void setSongId(long songId) {
        this.songId = songId;
    }

    // ADD THIS GETTER FOR ID
    public long getId() {
        return id;
    }

    // ADD THIS SETTER FOR ID (optional but good practice)
    public void setId(long id) {
        this.id = id;
    }

    // Other getters and setters...
    public String getTitle() {
        return title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }
}