package io.retrofitui.examples.todos;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class TodoStore {
    private final List<Todo> todos = new ArrayList<>();
    private final AtomicLong counter = new AtomicLong(1);

    public TodoStore() {
        todos.add(new Todo(counter.getAndIncrement(), "Buy milk",      false, "low"));
        todos.add(new Todo(counter.getAndIncrement(), "Walk the dog",  false, "medium"));
        todos.add(new Todo(counter.getAndIncrement(), "Write tests",   false, "high"));
    }

    public List<Todo> all() { return List.copyOf(todos); }

    public Optional<Todo> find(long id) {
        return todos.stream().filter(t -> t.getId() == id).findFirst();
    }

    public Todo create(Todo todo) {
        todo.setId(counter.getAndIncrement());
        todos.add(todo);
        return todo;
    }

    public Optional<Todo> update(long id, Todo update) {
        return find(id).map(t -> {
            t.setTitle(update.getTitle());
            t.setDone(update.isDone());
            t.setPriority(update.getPriority());
            return t;
        });
    }

    public boolean delete(long id) {
        return todos.removeIf(t -> t.getId() == id);
    }
}
