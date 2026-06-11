package io.retrofitui.autoconfigure.spec;

import java.util.List;

public class ColumnBuilder {
    private final String key;
    private final String label;
    private final String type;
    private boolean sortable = false;
    private boolean filterable = false;
    private boolean editable = false;
    private String width = null;
    private String alignment = "left";
    private List<FieldOption> options = null;

    ColumnBuilder(String key, String label, String type) {
        this.key = key;
        this.label = label;
        this.type = type;
    }

    public ColumnBuilder sortable(boolean sortable) { this.sortable = sortable; return this; }
    public ColumnBuilder filterable(boolean filterable) { this.filterable = filterable; return this; }
    public ColumnBuilder editable(boolean editable) { this.editable = editable; return this; }
    public ColumnBuilder width(String width) { this.width = width; return this; }
    public ColumnBuilder alignment(String alignment) { this.alignment = alignment; return this; }
    public ColumnBuilder options(List<FieldOption> options) { this.options = options; return this; }

    public Column build() {
        return new Column(key, label, type, sortable, filterable, editable, width, alignment, options);
    }
}
