package io.retrofitui.examples.todos;

import io.retrofitui.autoconfigure.spec.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class TodoController {

    private final TodoStore store;

    public TodoController(TodoStore store) {
        this.store = store;
    }

    // ── REST CRUD ─────────────────────────────────────────────────────────

    @GetMapping("/todos")
    public List<Todo> list() { return store.all(); }

    @GetMapping("/todos/{id}")
    public ResponseEntity<Todo> find(@PathVariable long id) {
        return store.find(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/todos")
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@RequestBody Todo todo) { return store.create(todo); }

    @PutMapping("/todos/{id}")
    public ResponseEntity<Todo> update(@PathVariable long id, @RequestBody Todo todo) {
        return store.update(id, todo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/todos/{id}")
    public Map<String, Boolean> delete(@PathVariable long id) {
        store.delete(id);
        return Map.of("ok", true);
    }

    // ── Retrofit UI spec endpoints ────────────────────────────────────────

    @GetMapping("/api/ui/todos")
    public TableSpec todosTableSpec() {
        return TableSpec.builder()
            .column("id",       "ID",       "number")
            .column("title",    "Title",    "string")
            .column(Column.builder("done", "Done", "boolean").editable(true).build())
            .column(Column.builder("priority", "Priority", "enum").editable(true)
                .options(List.of(
                    new FieldOption("low",    "low"),
                    new FieldOption("medium", "medium"),
                    new FieldOption("high",   "high")
                )).build())
            .list(EndpointDirective.get("/todos"))
            .find(EndpointDirective.get("/todos/{id}"))
            .create(EndpointDirective.post("/todos"))
            .update(EndpointDirective.put("/todos/{id}"))
            .delete(EndpointDirective.delete("/todos/{id}"))
            .build();
    }

    @GetMapping("/api/ui/todos/{id}")
    public FormSpec todoFormSpec(@PathVariable String id) {
        boolean isNew = "new".equals(id);
        var builder = FormSpec.builder()
            .field(Field.builder("title", "Title", "text").required(true).build())
            .field(Field.builder("done", "Done", "checkbox").build())
            .field(Field.builder("priority", "Priority", "select")
                .options(List.of(
                    new FieldOption("low",    "low"),
                    new FieldOption("medium", "medium"),
                    new FieldOption("high",   "high")
                )).build());
        if (isNew) {
            builder.create(EndpointDirective.post("/todos"));
        } else {
            builder.find(EndpointDirective.get("/todos/{id}"))
                   .update(EndpointDirective.put("/todos/{id}"))
                   .delete(EndpointDirective.delete("/todos/{id}"));
        }
        return builder.build();
    }
}
