package io.retrofitui.autoconfigure.spec;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TableSpecBuilder {
    private final List<Column> columns = new ArrayList<>();
    private final Map<String, EndpointDirective> endpoints = new HashMap<>();
    private String title = null;

    public TableSpecBuilder column(Column column) {
        columns.add(column);
        return this;
    }

    public TableSpecBuilder column(String key, String label, String type) {
        return column(Column.builder(key, label, type).build());
    }

    public TableSpecBuilder list(EndpointDirective ep) { endpoints.put("list", ep); return this; }
    public TableSpecBuilder find(EndpointDirective ep) { endpoints.put("find", ep); return this; }
    public TableSpecBuilder create(EndpointDirective ep) { endpoints.put("create", ep); return this; }
    public TableSpecBuilder update(EndpointDirective ep) { endpoints.put("update", ep); return this; }
    public TableSpecBuilder delete(EndpointDirective ep) { endpoints.put("delete", ep); return this; }
    public TableSpecBuilder title(String title) { this.title = title; return this; }

    public TableSpec build() {
        Map<String, Object> meta = title != null ? Map.of("title", title) : Map.of();
        return new TableSpec(List.copyOf(columns), Map.copyOf(endpoints), meta);
    }
}
