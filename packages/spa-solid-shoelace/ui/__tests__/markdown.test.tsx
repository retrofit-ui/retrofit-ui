// @vitest-environment jsdom
import { render } from 'solid-js/web';
import { afterEach, describe, expect, it } from 'vitest';
import { configureMarked, MarkdownViewComponent } from '../MarkdownView';

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  document.body.innerHTML = '';
});

function show(content: string): string {
  dispose = render(
    () => <MarkdownViewComponent spec={{ kind: 'markdown', content }} />,
    document.body,
  );
  return document.querySelector('.retrofit-markdown')?.innerHTML ?? '';
}

describe('MarkdownView sanitizing', () => {
  it('strips scripts and event handlers', () => {
    const html = show('hi <img src=x onerror="alert(1)"><script>x()</script>');
    expect(html).toContain('hi');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });

  it('keeps KaTeX-style output from extensions', () => {
    configureMarked({
      extensions: [
        {
          name: 'tex',
          level: 'inline',
          start: (src: string) => src.indexOf('$'),
          tokenizer(src: string) {
            const m = /^\$([^$]+)\$/.exec(src);
            return m && { type: 'tex', raw: m[0], text: m[1] };
          },
          renderer: (t: { text: string }) =>
            `<span class="katex" style="color:red"><math><mi>${t.text}</mi></math></span>`,
        },
      ],
    });
    const html = show('a $x$ b');
    expect(html).toContain('class="katex"');
    expect(html).toContain('style="color:red"');
    expect(html).toContain('<mi>x</mi>');
  });
});
