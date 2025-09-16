package com.music.MusicPlayer.Models;

import org.springframework.stereotype.Component;

@Component
public class SongDTO {

        private long songId;
        private String title;
        private String artist;
        private String imageUrl;
        private String previewUrl;

        // Getters and setters
        public long getSongId() { return songId; }
        public void setSongId(long songId) { this.songId = songId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getArtist() { return artist; }
        public void setArtist(String artist) { this.artist = artist; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getPreviewUrl() { return previewUrl; }
        public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }
    }


