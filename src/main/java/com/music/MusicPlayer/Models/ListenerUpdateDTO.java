package com.music.MusicPlayer.Models;

import java.util.Map;

public class ListenerUpdateDTO {
    private String name;
    private String profilePhoto;

    // Constructor from Map (for backward compatibility)
    public ListenerUpdateDTO(Map<String, Object> updates) {
        if (updates != null) {
            this.name = (String) updates.get("name");
            this.profilePhoto = (String) updates.get("profilePhoto");
        }
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    // Validation method
    public boolean isValid() {
        return (name != null && !name.trim().isEmpty()) ||
                (profilePhoto != null && !profilePhoto.trim().isEmpty());
    }

    public boolean hasNameUpdate() {
        return name != null && !name.trim().isEmpty();
    }

    public boolean hasProfilePhotoUpdate() {
        return profilePhoto != null && !profilePhoto.trim().isEmpty();
    }
}