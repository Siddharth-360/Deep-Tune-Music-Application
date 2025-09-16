package com.music.MusicPlayer.Repository;

import com.music.MusicPlayer.Models.Song;
import com.music.MusicPlayer.Models.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track,Long> {
    boolean existsBySongId(long songId);

    @Query("SELECT s FROM Track s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.artist) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Track> searchByTitleOrArtist(@Param("query") String query);
}
