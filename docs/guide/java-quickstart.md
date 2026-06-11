# Java Quickstart

Get a working admin table view with Spring Boot in under five minutes.

## Add the dependency

::: code-group

```kotlin [build.gradle.kts]
dependencies {
    implementation("io.retrofitui:retrofit-ui-spring-boot-starter:0.0.1-SNAPSHOT")
}
```

```xml [pom.xml]
<dependency>
    <groupId>io.retrofitui</groupId>
    <artifactId>retrofit-ui-spring-boot-starter</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

:::

## Bundle the SPA assets

The starter needs the pre-built SPA assets on the classpath. Until the package is published to npm, sync them from the local build:

```bash
just spa-assets
```

This builds `@retrofit-ui/spa-solid-shoelace` and copies the output to
`packages/retrofit-ui-spring-boot-autoconfigure/src/main/resources/META-INF/resources/retrofit-ui/`.

## Minimum working example

No configuration is required — the autoconfigure defaults work out of the box.

```java
import io.retrofitui.autoconfigure.spec.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ItemController {

    record Item(long id, String name, boolean active) {}

    private final List<Item> items = List.of(
        new Item(1, "First item",  true),
        new Item(2, "Second item", false)
    );

    // Your existing REST endpoint (unchanged)
    @GetMapping("/items")
    public List<Item> list() { return items; }

    // The spec endpoint — tells the SPA how to render the table
    @GetMapping("/api/ui/items")
    public TableSpec itemsSpec() {
        return TableSpec.builder()
            .column("id",     "ID",     "number")
            .column("name",   "Name",   "string")
            .column("active", "Active", "boolean")
            .list(EndpointDirective.get("/items"))
            .build();
    }
}
```

Start the app and open `http://localhost:8080/retrofit-ui`. The SPA loads and navigates to `#/items`, showing a table with three columns.

## Configuration

Override defaults in `application.properties`:

```properties
# Where the SPA is served (default: /retrofit-ui)
retrofit-ui.path=/admin

# Base path the SPA uses to call spec endpoints (default: /api/ui)
retrofit-ui.api-base=/api/ui

# Shoelace theme: "light" or "dark" (default: light)
retrofit-ui.theme=light
```

## Adding a form view

Return a `FormSpec` from a second endpoint to enable create/edit/delete:

```java
@GetMapping("/api/ui/items/{id}")
public FormSpec itemFormSpec(@PathVariable String id) {
    boolean isNew = "new".equals(id);
    var builder = FormSpec.builder()
        .field(Field.builder("name",   "Name",   "text").required(true).build())
        .field(Field.builder("active", "Active", "checkbox").build());

    if (isNew) {
        builder.create(EndpointDirective.post("/items"));
    } else {
        builder.find(EndpointDirective.get("/items/{id}"))
               .update(EndpointDirective.put("/items/{id}"))
               .delete(EndpointDirective.delete("/items/{id}"));
    }
    return builder.build();
}
```

Also wire `find` on the table spec so rows become clickable:

```java
TableSpec.builder()
    // ...columns...
    .list(EndpointDirective.get("/items"))
    .find(EndpointDirective.get("/items/{id}"))   // enables row clicks
    .create(EndpointDirective.post("/items"))
    .build()
```

## Next steps

- **Full spec builder API** — see [Java API Reference](/reference/java-api).
- **Run a full example** — `just example java todos` starts the todos Spring Boot example.
