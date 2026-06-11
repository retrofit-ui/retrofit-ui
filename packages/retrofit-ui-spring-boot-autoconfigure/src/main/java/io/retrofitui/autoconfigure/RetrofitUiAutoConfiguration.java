package io.retrofitui.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@AutoConfiguration
@ConditionalOnWebApplication
@EnableConfigurationProperties(RetrofitUiProperties.class)
public class RetrofitUiAutoConfiguration implements WebMvcConfigurer {

    private final RetrofitUiProperties props;

    public RetrofitUiAutoConfiguration(RetrofitUiProperties props) {
        this.props = props;
    }

    @Bean
    public RetrofitUiController retrofitUiController(RetrofitUiProperties props) {
        return new RetrofitUiController(props);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve SPA static assets (JS/CSS bundles) under the configured path prefix.
        // index.html is handled by RetrofitUiController.serveIndex() above.
        registry
            .addResourceHandler(props.getPath() + "/assets/**")
            .addResourceLocations("classpath:META-INF/resources/retrofit-ui/assets/");
    }
}
