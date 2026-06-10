package io.retrofitui.autoconfigure.spec;

import java.util.List;
import java.util.Map;

public record FormSpec(
    List<Field> fields,
    Map<String, EndpointDirective> endpoints,
    Map<String, Object> metadata
) {
    public static FormSpecBuilder builder() { return new FormSpecBuilder(); }
}
