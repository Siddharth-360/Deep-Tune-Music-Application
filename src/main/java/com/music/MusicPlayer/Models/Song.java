package com.music.MusicPlayer.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "songs")
@EqualsAndHashCode(exclude = {"likedByListeners", "recentlyPlayedByListeners"})
@ToString(exclude = {"likedByListeners", "recentlyPlayedByListeners"})
public class Song {

    @Id
    private Long songId;

    @Column(nullable = false)
    @JsonProperty("title")
    private String title;

    @Column(name = "image_url")
    @JsonProperty("imageUrl")
    private String imageUrl;

    @Column(nullable = false)
    @JsonProperty("artist")
    private String artist;

    @Column(name = "preview_url")
    @JsonProperty("previewUrl")
    private String previewUrl;




    // Relationship with Listener for liked songs
    @ManyToMany(mappedBy = "likedSongs", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent infinite recursion in JSON serialization
    private List<Listener> likedByListeners = new ArrayList<>();


    @ManyToMany(mappedBy = "recentlyPlayed", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent infinite recursion in JSON serialization
    private List<Listener> recentlyPlayedByListeners = new ArrayList<>();

    // Constructors
    public Song() {
    }

    public Song(String title, String artist, String imageUrl, String previewUrl) {
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
        this.previewUrl = previewUrl;
    }



    // Helper methods
    public int getLikeCount() {
        return likedByListeners.size();
    }

    public boolean isLikedByListener(Listener listener) {
        return likedByListeners.contains(listener);
    }

    // Format duration as MM:SS


    // Custom getters and setters for proper JSON handling

    public String getTitle() {
        return title;
    }
    public long getSongId() {
        return songId;
    }

    public void setSongId(long songId) {
        this.songId = songId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }



    public List<Listener> getLikedByListeners() {
        return likedByListeners;
    }

    public void setLikedByListeners(List<Listener> likedByListeners) {
        this.likedByListeners = likedByListeners;
    }

    public List<Listener> getRecentlyPlayedByListeners() {
        return recentlyPlayedByListeners;
    }

    public void setRecentlyPlayedByListeners(List<Listener> recentlyPlayedByListeners) {
        this.recentlyPlayedByListeners = recentlyPlayedByListeners;
    }
}