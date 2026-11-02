// @vitest-environment jsdom
import {
  getBasePath,
  setBasePath,
} from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIslands } from '../islands';
import { createShell, SHOELACE_CDN } from '../shell';

vi.mock('../toast', () => ({ showToast: vi.fn(), ToastContainer: () => null }));

const CDN = SHOELACE_CDN.replace(/\/$/, '');

beforeEach(() => {
  setBasePath(''); // unset: Shoelace has no base path yet
  // The config request fails; mount still sets the base path first.
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('', { status: 500 }),
  );
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

const shell = async (shoelacePath?: string) =>
  createShell({ shoelacePath }).mount(document.createElement('div'));
const islands = (shoelacePath?: string) =>
  createIslands({ rootElement: document.createElement('div'), shoelacePath });

describe.each([
  ['createShell', shell],
  ['createIslands', islands],
] as const)('%s base path', (_name, start) => {
  it('defaults to the CDN when the app set none', async () => {
    await start();
    expect(getBasePath()).toBe(CDN);
  });

  it("keeps the app's earlier setBasePath", async () => {
    setBasePath('/mine/');
    await start();
    expect(getBasePath()).toBe('/mine');
  });

  it('uses shoelacePath when given, over the app path', async () => {
    setBasePath('/mine/');
    await start('/given/');
    expect(getBasePath()).toBe('/given');
  });
});
