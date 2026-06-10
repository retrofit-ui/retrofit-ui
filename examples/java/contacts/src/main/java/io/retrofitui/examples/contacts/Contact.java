package io.retrofitui.examples.contacts;

public class Contact {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String type;
    private String notes;

    public Contact() {}

    public Contact(Long id, String name, String email, String phone, String type, String notes) {
        this.id = id; this.name = name; this.email = email;
        this.phone = phone; this.type = type; this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
