// Pure spec builders for the contacts example. Imported by src/server.ts AND
// docs/.vitepress/theme/ContactsDemo.vue. Must not import Node-only APIs.

import {
  col,
  type FormSpec,
  filterForm,
  formSpec,
  pageSpec,
  StatViewBuilder,
  TableFormWorkflowBundle,
  TableView,
} from '@retrofit-ui/builder-zod';
import { type Contact, ContactSchema, UpdateContactSchema } from './schemas';

export const contactsTheme = {
  cssVariables: {
    '--sl-color-primary-50': '#f0fdf4',
    '--sl-color-primary-100': '#dcfce7',
    '--sl-color-primary-200': '#bbf7d0',
    '--sl-color-primary-300': '#86efac',
    '--sl-color-primary-400': '#4ade80',
    '--sl-color-primary-500': '#22c55e',
    '--sl-color-primary-600': '#16a34a',
    '--sl-color-primary-700': '#15803d',
    '--sl-color-primary-800': '#166534',
    '--sl-color-primary-900': '#14532d',
    '--sl-color-primary-950': '#052e16',
  },
  extraCss: `.retrofit-thead { background-color: #14532d; }
.retrofit-th { color: #f0fdf4; border-bottom-color: #166534; }`,
};

// The bundle builds a matching table + form pair from one schema. `totalRows`
// is needed for pagination in the table metadata; caller supplies it based on
// its own store size.
export function buildContactsBundle(totalRows: number) {
  return (
    TableFormWorkflowBundle.schema(ContactSchema)
      .updateSchema(UpdateContactSchema)
      .table((t) =>
        t
          .columnOverride('name', { sortable: true })
          .metadata({ pagination: { pageSize: 2, totalRows } }),
      )
      .form((f) =>
        f
          .title('Contact')
          .fieldOverride('notes', { type: 'textarea' })
          .fieldOverride('phone', {
            placeholder: '+1 555 000 0000',
            validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
          }),
      )
      // The hash route the bundle's screens live under (see crudRoutes in
      // server.ts): adds the table's "New" button and sends forms back here.
      .route('/contacts')
      .list({ method: 'GET', url: '/contacts' })
      .create({ method: 'POST', url: '/contacts' })
      .update({ method: 'PUT', url: '/contacts/{id}' })
      .delete({ method: 'DELETE', url: '/contacts/{id}' })
      .build()
  );
}

export function buildContactsPageSpec(totalRows: number) {
  const bundle = buildContactsBundle(totalRows);
  return pageSpec()
    .title('Contacts')
    .layout(col())
    .table(bundle.tableSpec)
    .build();
}

// The create form when `entity` is undefined; otherwise that contact's edit
// form, prefilled and with its update/delete urls resolved to its id.
export function buildContactFormSpec(
  totalRows: number,
  entity: Contact | undefined,
): FormSpec {
  const bundle = buildContactsBundle(totalRows);
  return entity
    ? bundle.editForm(entity, { id: entity.id })
    : bundle.createForm;
}

export function buildContactsByTypeSpec() {
  return pageSpec()
    .title('Contacts by Type')
    .filterForm(
      filterForm()
        .field('type', {
          type: 'select',
          label: 'Contact Type',
          placeholder: 'All Types',
          options: [
            { label: 'Work', value: 'work' },
            { label: 'Personal', value: 'personal' },
            { label: 'Other', value: 'other' },
          ],
        })
        .build(),
    )
    .form(
      formSpec(ContactSchema, UpdateContactSchema)
        .fieldOverride('notes', { type: 'textarea' })
        .fieldOverride('phone', { placeholder: '+1 555 000 0000' })
        .create({ method: 'POST', url: '/contacts' })
        .build(),
      'Add Contact',
    )
    .table(
      TableView.schema(ContactSchema)
        .visibleColumns(['name', 'email', 'phone', 'type'])
        .list({ method: 'GET', url: '/contacts' })
        .build(),
    )
    .build();
}

export function buildContactsStatsSpec(totalContacts: number) {
  return new StatViewBuilder()
    .title('Contacts Dashboard')
    .stat({
      label: 'Total Contacts',
      value: totalContacts,
      format: 'number',
    })
    .stat({
      label: 'Sync Status',
      value: '—',
      description: 'External sync unavailable',
    })
    .build();
}
