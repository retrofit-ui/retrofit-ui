package io.retrofitui.examples.contacts;

import io.retrofitui.autoconfigure.spec.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ContactController {

    private final ContactStore store;

    public ContactController(ContactStore store) {
        this.store = store;
    }

    // ── REST CRUD ─────────────────────────────────────────────────────────

    @GetMapping("/contacts")
    public List<Contact> list() { return store.all(); }

    @GetMapping("/contacts/{id}")
    public ResponseEntity<Contact> find(@PathVariable long id) {
        return store.find(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/contacts")
    @ResponseStatus(HttpStatus.CREATED)
    public Contact create(@RequestBody Contact contact) { return store.create(contact); }

    @PutMapping("/contacts/{id}")
    public ResponseEntity<Contact> update(@PathVariable long id, @RequestBody Contact contact) {
        return store.update(id, contact).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contacts/{id}")
    public Map<String, Boolean> delete(@PathVariable long id) {
        store.delete(id);
        return Map.of("ok", true);
    }

    // ── Retrofit UI spec endpoints ────────────────────────────────────────

    @GetMapping("/api/ui/contacts")
    public TableSpec contactsTableSpec() {
        return TableSpec.builder()
            .column(Column.builder("name",  "Name",  "string").sortable(true).build())
            .column(Column.builder("email", "Email", "string").filterable(true).build())
            .column("phone", "Phone", "string")
            .column(Column.builder("type", "Type", "enum")
                .options(List.of(
                    new FieldOption("work",     "work"),
                    new FieldOption("personal", "personal"),
                    new FieldOption("other",    "other")
                )).build())
            .list(EndpointDirective.get("/contacts"))
            .find(EndpointDirective.get("/contacts/{id}"))
            .create(EndpointDirective.post("/contacts"))
            .update(EndpointDirective.put("/contacts/{id}"))
            .delete(EndpointDirective.delete("/contacts/{id}"))
            .build();
    }

    @GetMapping("/api/ui/contacts/{id}")
    public FormSpec contactFormSpec(@PathVariable String id) {
        boolean isNew = "new".equals(id);
        var builder = FormSpec.builder()
            .field(Field.builder("name",  "Name",  "text").required(true).build())
            .field(Field.builder("email", "Email", "email").required(true).build())
            .field(Field.builder("phone", "Phone", "text")
                .placeholder("+1 555 000 0000").build())
            .field(Field.builder("type", "Type", "select")
                .options(List.of(
                    new FieldOption("work",     "work"),
                    new FieldOption("personal", "personal"),
                    new FieldOption("other",    "other")
                )).build())
            .field(Field.builder("notes", "Notes", "textarea").build());
        if (isNew) {
            builder.create(EndpointDirective.post("/contacts"));
        } else {
            builder.find(EndpointDirective.get("/contacts/{id}"))
                   .update(EndpointDirective.put("/contacts/{id}"))
                   .delete(EndpointDirective.delete("/contacts/{id}"));
        }
        return builder.build();
    }
}
