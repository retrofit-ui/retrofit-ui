# Java API Reference

All types live in `io.retrofitui.autoconfigure` and `io.retrofitui.autoconfigure.spec`.

---

## `RetrofitUiProperties`

`@ConfigurationProperties(prefix = "retrofit-ui")`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `path` | `String` | `/retrofit-ui` | URL prefix where the SPA and `/retrofit.json` are served |
| `apiBase` | `String` | `/api/ui` | Base path the SPA uses when calling spec endpoints |
| `theme` | `String` | `light` | Shoelace theme name: `"light"` or `"dark"` |

```properties
retrofit-ui.path=/admin
retrofit-ui.api-base=/api/ui
retrofit-ui.theme=light
```

---

## `TableSpec`

```java
public record TableSpec(
    List<Column> columns,
    Map<String, EndpointDirective> endpoints,
    Map<String, Object> metadata
)
```

Endpoint keys: `"list"`, `"find"`, `"create"`, `"update"`, `"delete"`.

### `TableSpec.builder()` → `TableSpecBuilder`

```java
TableSpec.builder()
    .column("id",    "ID",    "number")          // shorthand: key, label, type
    .column(Column.builder("status", "Status", "enum")
        .filterable(true)
        .options(List.of(new FieldOption("draft", "draft")))
        .build())
    .list(EndpointDirective.get("/items"))
    .find(EndpointDirective.get("/items/{id}"))
    .create(EndpointDirective.post("/items"))
    .update(EndpointDirective.put("/items/{id}"))
    .delete(EndpointDirective.delete("/items/{id}"))
    .title("Items")                               // optional metadata title
    .build();
```

| Method | Description |
|--------|-------------|
| `column(Column)` | Add a pre-built column |
| `column(key, label, type)` | Add a column with defaults |
| `list/find/create/update/delete(EndpointDirective)` | Wire an endpoint |
| `title(String)` | Set `metadata.title` |
| `build()` | Returns `TableSpec` |

---

## `FormSpec`

```java
public record FormSpec(
    List<Field> fields,
    Map<String, EndpointDirective> endpoints,
    Map<String, Object> metadata
)
```

### `FormSpec.builder()` → `FormSpecBuilder`

```java
FormSpec.builder()
    .field("name",   "Name",   "text")            // shorthand
    .field(Field.builder("notes", "Notes", "textarea").build())
    .find(EndpointDirective.get("/items/{id}"))
    .update(EndpointDirective.put("/items/{id}"))
    .delete(EndpointDirective.delete("/items/{id}"))
    .build();
```

| Method | Description |
|--------|-------------|
| `field(Field)` | Add a pre-built field |
| `field(name, label, type)` | Add a field with defaults |
| `find/create/update/delete(EndpointDirective)` | Wire an endpoint |
| `title(String)` | Set `metadata.title` |
| `build()` | Returns `FormSpec` |

---

## `Column`

```java
public record Column(
    String key, String label, String type,
    boolean sortable, boolean filterable, boolean editable,
    String width, String alignment,
    List<FieldOption> options
)
```

Column types: `"string"`, `"number"`, `"date"`, `"boolean"`, `"enum"`.

### `Column.builder(key, label, type)` → `ColumnBuilder`

```java
Column.builder("status", "Status", "enum")
    .sortable(true)
    .filterable(true)
    .editable(true)
    .width("120px")
    .alignment("center")          // "left" | "center" | "right"
    .options(List.of(
        new FieldOption("draft",     "draft"),
        new FieldOption("published", "published")
    ))
    .build();
```

---

## `Field`

```java
public record Field(
    String name, String label, String type,
    boolean required, boolean readOnly,
    String placeholder, String helpText,
    List<FieldOption> options
)
```

Field types: `"text"`, `"email"`, `"number"`, `"date"`, `"select"`, `"checkbox"`, `"textarea"`, `"markdown"`.

### `Field.builder(name, label, type)` → `FieldBuilder`

```java
Field.builder("phone", "Phone", "text")
    .required(true)
    .readOnly(false)
    .placeholder("+1 555 000 0000")
    .helpText("Include country code")
    .options(List.of(...))        // for select fields
    .build();
```

---

## `EndpointDirective`

```java
public record EndpointDirective(String method, String url)
```

Static factory methods:

```java
EndpointDirective.get("/items")          // GET /items
EndpointDirective.post("/items")         // POST /items
EndpointDirective.put("/items/{id}")     // PUT /items/{id}
EndpointDirective.delete("/items/{id}")  // DELETE /items/{id}
```

`{id}` in URLs is substituted by the SPA at runtime using the row's id value.

---

## `FieldOption`

```java
public record FieldOption(String value, String label)
```

Used for `enum`-typed columns and `select`-typed fields.
