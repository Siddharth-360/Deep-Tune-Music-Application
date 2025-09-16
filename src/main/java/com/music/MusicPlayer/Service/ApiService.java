package com.music.MusicPlayer.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.music.MusicPlayer.Models.Track;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

@Service
public class ApiService {
    @Autowired
    TrackService trackService;

    private static final String RAPIDAPI_KEY = "ab58642f58msh6141ae637a67615p120e67jsn9793ab72f152";
    private static final String RAPIDAPI_HOST = "shazam-api6.p.rapidapi.com";

    public void searchTracks() {
        try {
            System.out.println("Sending request...");
            // Construct URI with dynamic query
            URI uri = URI.create("https://shazam-api6.p.rapidapi.com/shazam/top_tracks_country?country_code=IN&limit=50");

            // Build the HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("x-rapidapi-key", RAPIDAPI_KEY)
                    .header("x-rapidapi-host", RAPIDAPI_HOST)
                    .GET()
                    .build();

            // Send the request
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

            // Print the response
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Length: " + response.body().length());
            System.out.println(response.body());
            if (response.body().isEmpty()) {
                System.out.println("Response body is empty.");
            }
            if (response.statusCode() == 200) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.body());

                // Check if status is true
                boolean status = root.path("status").asBoolean(false);
                if (!status) {
                    System.out.println("API returned status: false");
                    return;
                }

                // Navigate to result.data
                JsonNode data = root.path("result").path("data");

                if (data.isArray()) {
                    System.out.println("Found " + data.size() + " tracks\n");

                    for (JsonNode song : data) {
                        JsonNode attributes = song.path("attributes");
                        long songId = attributes.path("playParams").path("id").asLong();
                        String title = attributes.path("name").asText("N/A");
                        String artist = attributes.path("artistName").asText("N/A");
                        String album = attributes.path("albumName").asText("N/A");

                        // Get image URL
                        String imageUrl = attributes.path("artwork").path("url").asText("");
                        if (!imageUrl.isEmpty()) {
                            imageUrl = imageUrl.replace("{w}", "500").replace("{h}", "500");
                        }

                        // Get preview URL
                        String previewUrl = "";
                        JsonNode previews = attributes.path("previews");
                        if (previews.isArray() && previews.size() > 0) {
                            previewUrl = previews.get(0).path("url").asText("");
                        }
                        Track t1 = new Track(songId,
                                title, artist,  imageUrl,  previewUrl);
                        trackService.saveTrack(t1);

                        System.out.println("Id: " + songId);
                        System.out.println("Title: " + title);
                        System.out.println("Artist: " + artist);
                        System.out.println("Album: " + album);
                        System.out.println("Image URL: " + imageUrl);
                        System.out.println("Preview URL: " + previewUrl);
                        System.out.println("---");
                    }
                }
            }else {
                System.out.println("Failed to fetch data: HTTP status " + response.statusCode());
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error fetching data: " + e.getMessage());
        }
    }
}