package com.music.MusicPlayer.Repository;

import com.music.MusicPlayer.Models.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SongRepository extends JpaRepository<Song,Long> {
 boolean existsBySongId(long songId);
 Optional<Song> findBySongId(long songId);

    @Query("SELECT s FROM Song s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.artist) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Song> searchByTitleOrArtist(@Param("query") String query);
}
