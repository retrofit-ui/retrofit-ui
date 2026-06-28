// Shared singleton for the retrofit-ui renderer controller.
// init() can only be called once per page — cache the result here so all
// demo components share the same controller across SPA navigations.

type Controller = {
  mount: (spec: unknown, el: HTMLElement) => () => void;
  unmount: (el: HTMLElement) => void;
  unmountAll: () => void;
};

let _controller: Controller | null = null;

export async function getController(): Promise<Controller> {
  if (_controller) return _controller;
  const { init } = await import('@retrofit-ui/spa-solid-shoelace/renderer');
  _controller = init({ rootElement: document.body, apiBase: '' }) as Controller;
  return _controller;
}
