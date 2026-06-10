package io.retrofitui.examples.contacts;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ContactStore {
    private final List<Contact> contacts = new ArrayList<>();
    private final AtomicLong counter = new AtomicLong(1);

    public ContactStore() {
        contacts.add(new Contact(counter.getAndIncrement(), "Alice Johnson", "alice@example.com", "+1 555 000 0001", "work",     null));
        contacts.add(new Contact(counter.getAndIncrement(), "Bob Smith",     "bob@example.com",   "+1 555 000 0002", "personal", null));
        contacts.add(new Contact(counter.getAndIncrement(), "Carol White",   "carol@example.com", "+1 555 000 0003", "work",     null));
    }

    public List<Contact> all() { return List.copyOf(contacts); }

    public Optional<Contact> find(long id) {
        return contacts.stream().filter(c -> c.getId() == id).findFirst();
    }

    public Contact create(Contact contact) {
        contact.setId(counter.getAndIncrement());
        contacts.add(contact);
        return contact;
    }

    public Optional<Contact> update(long id, Contact update) {
        return find(id).map(c -> {
            c.setName(update.getName()); c.setEmail(update.getEmail());
            c.setPhone(update.getPhone()); c.setType(update.getType());
            c.setNotes(update.getNotes());
            return c;
        });
    }

    public boolean delete(long id) {
        return contacts.removeIf(c -> c.getId() == id);
    }
}
