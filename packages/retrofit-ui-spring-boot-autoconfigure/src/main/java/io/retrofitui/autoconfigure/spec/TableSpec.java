package io.retrofitui.autoconfigure.spec;

import java.util.List;
import java.util.Map;

public record TableSpec(
    List<Column> columns,
    Map<String, EndpointDirective> endpoints,
    Map<String, Object> metadata
) {
    public static TableSpecBuilder builder() { return new TableSpecBuilder(); }
}
