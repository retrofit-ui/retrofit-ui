package io.retrofitui.autoconfigure.spec;

import java.util.List;

public class FieldBuilder {
    private final String name;
    private final String label;
    private final String type;
    private boolean required = false;
    private boolean readOnly = false;
    private String placeholder = null;
    private String helpText = null;
    private List<FieldOption> options = null;

    FieldBuilder(String name, String label, String type) {
        this.name = name;
        this.label = label;
        this.type = type;
    }

    public FieldBuilder required(boolean required) { this.required = required; return this; }
    public FieldBuilder readOnly(boolean readOnly) { this.readOnly = readOnly; return this; }
    public FieldBuilder placeholder(String placeholder) { this.placeholder = placeholder; return this; }
    public FieldBuilder helpText(String helpText) { this.helpText = helpText; return this; }
    public FieldBuilder options(List<FieldOption> options) { this.options = options; return this; }

    public Field build() {
        return new Field(name, label, type, required, readOnly, placeholder, helpText, options);
    }
}
