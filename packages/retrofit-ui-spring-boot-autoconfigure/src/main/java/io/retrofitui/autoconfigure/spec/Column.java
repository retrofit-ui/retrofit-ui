package io.retrofitui.autoconfigure.spec;

import java.util.List;

public record Column(
    String key,
    String label,
    String type,
    boolean sortable,
    boolean filterable,
    boolean editable,
    String width,
    String alignment,
    List<FieldOption> options
) {
    public static ColumnBuilder builder(String key, String label, String type) {
        return new ColumnBuilder(key, label, type);
    }
}
