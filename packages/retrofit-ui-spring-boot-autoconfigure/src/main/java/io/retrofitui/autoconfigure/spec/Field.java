package io.retrofitui.autoconfigure.spec;

import java.util.List;

public record Field(
    String name,
    String label,
    String type,
    boolean required,
    boolean readOnly,
    String placeholder,
    String helpText,
    List<FieldOption> options
) {
    public static FieldBuilder builder(String name, String label, String type) {
        return new FieldBuilder(name, label, type);
    }
}
