import {
  createRetrofitApp,
  resource,
} from '@retrofit-ui/server-solid-shoelace';
import { ContactSchema, UpdateContactSchema } from './schemas';
import { store } from './store';

const app = createRetrofitApp({
  theme: {
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
  },
  resources: {
    contacts: resource(ContactSchema)
      .updateSchema(UpdateContactSchema)
      .columnOverride('name', { sortable: true })
      .columnOverride('email', { filterable: true })
      .fieldOverride('notes', { type: 'textarea' })
      .fieldOverride('phone', {
        placeholder: '+1 555 000 0000',
        validation: { pattern: '^\\+?[\\d\\s\\-()]+$' },
      })
      .list(() => store.all())
      .find((id) => store.find(id))
      .create((data) => store.create(data))
      .update((id, data) => store.update(id, data))
      .delete((id) => store.delete(id))
      .build(),
  },
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Contacts server running at http://localhost:${PORT}`);
});
