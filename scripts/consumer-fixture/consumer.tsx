// Compiled against the *packed* packages by scripts/check-consumer-types.mjs,
// the way an app would: strict, skipLibCheck off, every public entry. Each
// expected-error directive below fails the check if the types degrade to `any`.
import type {
  ActionDescriptor,
  ActionEntry,
  CardSpec,
  Spec,
  SpecNode,
} from '@retrofit-ui/core';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import {
  type ActionHandlers,
  createRenderer,
  defineKind,
  defineKit,
  useActions,
} from '@retrofit-ui/spa-solid-shoelace/components';
import { init } from '@retrofit-ui/spa-solid-shoelace/renderer';
import '@retrofit-ui/spa-solid-shoelace/renderer.css';

interface RatingSpec extends SpecNode<'acme.rating'> {
  score: number;
}
interface RateAction extends ActionDescriptor<'acme.rate'> {
  stars: number;
}

declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'acme.rating': RatingSpec;
  }
  interface ActionKinds {
    'acme.rate': ActionEntry<RateAction, { itemId: string }, boolean>;
  }
}

const rating = defineKind({
  kind: 'acme.rating',
  component: (props) => {
    const { dispatch } = useActions();
    const rated: Promise<boolean> = dispatch(
      { type: 'acme.rate', stars: props.spec.score },
      { itemId: 'espresso' },
    );
    void rated;
    return <span>{props.spec.score}</span>;
  },
});

const kit = defineKit({ name: 'acme', kinds: [rating] });

const actions: ActionHandlers = {
  'acme.rate': (action, input) => action.stars > 0 && input.itemId !== '',
  http: async (_action, _input, next) => {
    const response: Response = await next();
    return response;
  },
};

const { SpecRenderer } = createRenderer({ kits: [kit], actions });

// An app kind nested in a built-in container, checked as a literal.
const card: CardSpec = {
  kind: 'card',
  children: [{ kind: 'acme.rating', score: 3 }],
};

export const App = () => <SpecRenderer spec={card} />;

init({ rootElement: document.body, apiBase: '/api', actions });

export const shell: string = distPath;

// @ts-expect-error not a registered kind
export const unknownKind: Spec = { kind: 'acme.unknown' };

// @ts-expect-error a rating's score is a number
export const badRating: Spec = { kind: 'acme.rating', score: 'high' };

// @ts-expect-error kits is a list of kits
createRenderer({ kits: 'acme' });

// @ts-expect-error init needs a root element
init({ apiBase: '/api' });

// @ts-expect-error acme.rate's input is { itemId: string }
export const badHandlers: ActionHandlers = {
  'acme.rate': (_a, input: number) => input > 0,
};
