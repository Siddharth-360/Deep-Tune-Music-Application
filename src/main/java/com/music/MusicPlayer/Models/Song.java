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

    // NEW: Duration field in milliseconds
    @Column(name = "duration_ms")
    @JsonProperty("duration")
    private Long duration = 0L;

    // NEW: Genre/Type of song
    @Column(name = "genre")
    @JsonProperty("genre")
    private String genre;

    // NEW: Sub-genre or specific type
    @Column(name = "sub_genre")
    @JsonProperty("subGenre")
    private String subGenre;

    // NEW: Music characteristics (comma-separated values)
    @Column(name = "tags")
    @JsonProperty("tags")
    private String tags;

    // NEW: Release year
    @Column(name = "release_year")
    @JsonProperty("releaseYear")
    private Integer releaseYear;

    // NEW: Album name
    @Column(name = "album_name")
    @JsonProperty("albumName")
    private String albumName;

    // NEW: Popularity score (0-100)
    @Column(name = "popularity")
    @JsonProperty("popularity")
    private Integer popularity = 0;

    // NEW: Explicit content flag
    @Column(name = "is_explicit")
    @JsonProperty("isExplicit")
    private Boolean isExplicit = false;

    // Relationship with Listener for liked songs
    @ManyToMany(mappedBy = "likedSongs", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Listener> likedByListeners = new ArrayList<>();

    @ManyToMany(mappedBy = "recentlyPlayed", fetch = FetchType.LAZY)
    @JsonIgnore
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

    // NEW: Enhanced constructor with genre
    public Song(String title, String artist, String imageUrl, String previewUrl,
                Long duration, String genre, String albumName) {
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
        this.previewUrl = previewUrl;
        this.duration = duration;
        this.genre = genre;
        this.albumName = albumName;
    }

    // Helper methods
    public int getLikeCount() {
        return likedByListeners.size();
    }

    public boolean isLikedByListener(Listener listener) {
        return likedByListeners.contains(listener);
    }

    // NEW: Format duration as MM:SS
    public String getFormattedDuration() {
        if (duration == null || duration == 0) {
            return "0:00";
        }
        long seconds = duration / 1000;
        long minutes = seconds / 60;
        long remainingSeconds = seconds % 60;
        return String.format("%d:%02d", minutes, remainingSeconds);
    }

    // NEW: Check if song has specific tag
    public boolean hasTag(String tag) {
        if (tags == null || tags.isEmpty()) {
            return false;
        }
        String[] tagArray = tags.split(",");
        for (String t : tagArray) {
            if (t.trim().equalsIgnoreCase(tag)) {
                return true;
            }
        }
        return false;
    }

    // NEW: Add tag to song
    public void addTag(String tag) {
        if (tags == null || tags.isEmpty()) {
            tags = tag;
        } else {
            // Check if tag already exists
            if (!hasTag(tag)) {
                tags += "," + tag;
            }
        }
    }

    // NEW: Remove tag from song
    public void removeTag(String tag) {
        if (tags != null && !tags.isEmpty()) {
            String[] tagArray = tags.split(",");
            List<String> tagList = new ArrayList<>();
            for (String t : tagArray) {
                if (!t.trim().equalsIgnoreCase(tag)) {
                    tagList.add(t.trim());
                }
            }
            tags = String.join(",", tagList);
        }
    }

    // NEW: Get all tags as list
    public List<String> getTagsList() {
        List<String> tagList = new ArrayList<>();
        if (tags != null && !tags.isEmpty()) {
            String[] tagArray = tags.split(",");
            for (String tag : tagArray) {
                tagList.add(tag.trim());
            }
        }
        return tagList;
    }

    // NEW: Check if song matches genre
    public boolean isGenre(String genreToCheck) {
        if (genre == null) {
            return false;
        }
        return genre.equalsIgnoreCase(genreToCheck);
    }

    // NEW: Get full genre description
    public String getFullGenreDescription() {
        if (genre == null && subGenre == null) {
            return "Unknown Genre";
        } else if (subGenre == null) {
            return genre;
        } else if (genre == null) {
            return subGenre;
        } else {
            return genre + " - " + subGenre;
        }
    }

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

    // NEW: Duration getter and setter
    public long getDuration() {
        return this.duration != null ? this.duration : 0L;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    // NEW: Genre getter and setter
    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    // NEW: SubGenre getter and setter
    public String getSubGenre() {
        return subGenre;
    }

    public void setSubGenre(String subGenre) {
        this.subGenre = subGenre;
    }

    // NEW: Tags getter and setter
    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    // NEW: ReleaseYear getter and setter
    public Integer getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }

    // NEW: AlbumName getter and setter
    public String getAlbumName() {
        return albumName;
    }

    public void setAlbumName(String albumName) {
        this.albumName = albumName;
    }

    // NEW: Popularity getter and setter
    public Integer getPopularity() {
        return popularity != null ? popularity : 0;
    }

    public void setPopularity(Integer popularity) {
        this.popularity = popularity;
    }

    // NEW: IsExplicit getter and setter
    public Boolean getIsExplicit() {
        return isExplicit != null ? isExplicit : false;
    }

    public void setIsExplicit(Boolean isExplicit) {
        this.isExplicit = isExplicit;
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

    public Long getId() {
        return this.songId;
    }
}