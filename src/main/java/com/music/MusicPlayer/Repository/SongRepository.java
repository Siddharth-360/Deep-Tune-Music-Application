package com.music.MusicPlayer.Repository;

import com.music.MusicPlayer.Models.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    boolean existsBySongId(Long songId);

    Optional<Song> findById(Long id);

    // NEW: Find songs by genre
    List<Song> findByGenreIgnoreCase(String genre);

    // NEW: Find songs by sub-genre
    List<Song> findBySubGenreIgnoreCase(String subGenre);

    // NEW: Find songs containing specific tag
    @Query("SELECT s FROM Song s WHERE LOWER(s.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<Song> findByTagContaining(@Param("tag") String tag);

    // NEW: Find songs by artist and genre
    List<Song> findByArtistIgnoreCaseAndGenreIgnoreCase(String artist, String genre);

    // NEW: Find songs by release year range
    List<Song> findByReleaseYearBetween(Integer startYear, Integer endYear);

    // NEW: Find popular songs (popularity above threshold)
    List<Song> findByPopularityGreaterThanEqual(Integer popularity);

    // NEW: Find non-explicit songs
    List<Song> findByIsExplicitFalse();

    // NEW: Search songs by multiple criteria
    @Query("SELECT s FROM Song s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.genre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Song> searchSongs(@Param("query") String query);

    // NEW: Find songs by album
    List<Song> findByAlbumNameIgnoreCase(String albumName);
}