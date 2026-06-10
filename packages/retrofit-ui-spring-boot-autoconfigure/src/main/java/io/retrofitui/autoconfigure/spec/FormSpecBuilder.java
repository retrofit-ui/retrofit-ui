package io.retrofitui.autoconfigure.spec;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FormSpecBuilder {
    private final List<Field> fields = new ArrayList<>();
    private final Map<String, EndpointDirective> endpoints = new HashMap<>();
    private String title = null;

    public FormSpecBuilder field(Field field) {
        fields.add(field);
        return this;
    }

    public FormSpecBuilder field(String name, String label, String type) {
        return field(Field.builder(name, label, type).build());
    }

    public FormSpecBuilder find(EndpointDirective ep) { endpoints.put("find", ep); return this; }
    public FormSpecBuilder create(EndpointDirective ep) { endpoints.put("create", ep); return this; }
    public FormSpecBuilder update(EndpointDirective ep) { endpoints.put("update", ep); return this; }
    public FormSpecBuilder delete(EndpointDirective ep) { endpoints.put("delete", ep); return this; }
    public FormSpecBuilder title(String title) { this.title = title; return this; }

    public FormSpec build() {
        Map<String, Object> meta = title != null ? Map.of("title", title) : Map.of();
        return new FormSpec(List.copyOf(fields), Map.copyOf(endpoints), meta);
    }
}
