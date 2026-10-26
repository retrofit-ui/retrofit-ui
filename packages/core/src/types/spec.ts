import type {
  CardSpec,
  DetailsSpec,
  FilterFormSpec,
  FlexSpec,
  GridSpec,
  PageSpec,
  TabsSpec,
  TextSpec,
} from './page';
import type {
  CalendarSpec,
  FormSpec,
  MarkdownViewSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
} from './resource-spec';

/** Every spec node: a `kind` that says which component draws it. */
export interface SpecNode<K extends string = string> {
  kind: K;
}

/**
 * A spec node that lays out other spec nodes. `children` is `Spec[]`, so it
 * holds every registered kind, including the ones an app adds to `SpecKinds`.
 */
export interface ContainerSpec<K extends string = string> extends SpecNode<K> {
  children: Spec[];
}

/** The kinds retrofit-ui ships, keyed by `kind`. */
export interface BuiltinSpecKinds {
  table: TableSpec;
  form: FormSpec;
  'filter-form': FilterFormSpec;
  markdown: MarkdownViewSpec;
  stat: StatSpec;
  calendar: CalendarSpec;
  tree: TreeSpec;
  timeline: TimelineSpec;
  text: TextSpec;
  details: DetailsSpec;
  page: PageSpec;
  card: CardSpec;
  flex: FlexSpec;
  grid: GridSpec;
  tabs: TabsSpec;
}

/**
 * Every kind a spec can be, keyed by `kind`. Apps add their own by
 * augmenting this interface, once:
 *
 * ```ts
 * declare module '@retrofit-ui/core' {
 *   interface SpecKinds {
 *     'acme.rating': RatingSpec;
 *   }
 * }
 * ```
 *
 * Each entry's `kind` must equal its key.
 */
export interface SpecKinds extends BuiltinSpecKinds {}

export type SpecKind = keyof SpecKinds;

/** The spec for one kind. */
export type SpecOf<K extends SpecKind> = SpecKinds[K];

/** Any spec node: the union of every registered kind. */
export type Spec = SpecKinds[SpecKind];
