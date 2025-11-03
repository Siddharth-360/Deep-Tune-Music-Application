package com.music.MusicPlayer.Models;

import org.springframework.stereotype.Component;

@Component
public class SongDTO {


        public Long getSongId() {
                return songId;
        }

        public void setSongId(Long songId) {
                this.songId = songId;
        }

        private Long songId;
                private String title;
                private String artist;
                private Long duration;
                private String imageUrl;
                private String previewUrl;

        public boolean isLiked() {
                return liked;
        }

        public void setLiked(boolean liked) {
                this.liked = liked;
        }

        public String getPreviewUrl() {
                return previewUrl;
        }

        public void setPreviewUrl(String previewUrl) {
                this.previewUrl = previewUrl;
        }

        public String getImageUrl() {
                return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
                this.imageUrl = imageUrl;
        }

        public Long getDuration() {
                return duration;
        }

        public void setDuration(Long duration) { // Change parameter type to Long
                this.duration = duration;
        }

        public String getArtist() {
                return artist;
        }

        public void setArtist(String artist) {
                this.artist = artist;
        }

        public String getTitle() {
                return title;
        }

        public void setTitle(String title) {
                this.title = title;
        }

//        public Long getId() {
//                return id;
//        }
//
//        public void setId(Long id) {
//                this.id = id;
//        }

        private boolean liked;

//        public void setSongId(long songId) {
//                this.songId = songId;
//        }

        // Constructors, getters, and setters


        // Getters and setters

    }


