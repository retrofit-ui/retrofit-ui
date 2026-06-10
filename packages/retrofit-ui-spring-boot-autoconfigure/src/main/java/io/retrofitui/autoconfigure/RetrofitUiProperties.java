package io.retrofitui.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "retrofit-ui")
public class RetrofitUiProperties {

    /** URL prefix where the SPA and /retrofit.json are served. */
    private String path = "/retrofit-ui";

    /** Base URL the SPA uses to call resource API endpoints. */
    private String apiBase = "/api/ui";

    /** Shoelace theme name ("light" or "dark"). */
    private String theme = "light";

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getApiBase() { return apiBase; }
    public void setApiBase(String apiBase) { this.apiBase = apiBase; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
