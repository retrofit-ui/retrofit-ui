// The `/renderer.css` subpath is a plain stylesheet — declared so TS accepts
// the side-effect import.
declare module '@retrofit-ui/spa-solid-shoelace/renderer.css';

// Plain .css side-effect imports (Vite handles these at runtime).
declare module '*.css';
