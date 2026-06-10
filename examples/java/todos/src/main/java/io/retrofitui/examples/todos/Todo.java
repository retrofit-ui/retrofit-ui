package io.retrofitui.examples.todos;

public class Todo {
    private Long id;
    private String title;
    private boolean done;
    private String priority;

    public Todo() {}

    public Todo(Long id, String title, boolean done, String priority) {
        this.id = id;
        this.title = title;
        this.done = done;
        this.priority = priority;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
