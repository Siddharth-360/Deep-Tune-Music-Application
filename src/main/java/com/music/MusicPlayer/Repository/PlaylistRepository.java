package com.music.MusicPlayer.Repositories;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Models.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByOwner(Listener owner);

    Optional<Playlist> findByIdAndOwner(Long id, Listener owner);

    Optional<Playlist> findByNameAndOwner(String name, Listener owner);

    @Query("SELECT p FROM Playlist p WHERE p.owner = :owner AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Playlist> findByOwnerAndNameContainingIgnoreCase(@Param("owner") Listener owner, @Param("name") String name);

    boolean existsByNameAndOwner(String name, Listener owner);
}