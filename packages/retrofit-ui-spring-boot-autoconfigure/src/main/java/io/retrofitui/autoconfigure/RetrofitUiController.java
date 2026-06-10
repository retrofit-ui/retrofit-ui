package io.retrofitui.autoconfigure;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
public class RetrofitUiController {

    private final RetrofitUiProperties props;

    public RetrofitUiController(RetrofitUiProperties props) {
        this.props = props;
    }

    /** Config endpoint consumed by the SPA on startup to discover apiBase and theme. */
    @GetMapping("/retrofit.json")
    public Map<String, String> retrofitConfig() {
        return Map.of(
            "apiBase", props.getApiBase(),
            "theme",   props.getTheme()
        );
    }

    /**
     * Serves index.html for the SPA root path.
     * Static assets (JS/CSS) are served automatically by Spring Boot from
     * META-INF/resources/retrofit-ui/ on the classpath.
     */
    @GetMapping(value = "${retrofit-ui.path}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> serveIndex() throws IOException {
        Resource resource = new ClassPathResource("META-INF/resources/retrofit-ui/index.html");
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        String html = resource.getContentAsString(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(html);
    }
}
