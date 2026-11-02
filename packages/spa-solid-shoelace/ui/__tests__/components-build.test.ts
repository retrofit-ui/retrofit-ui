import { describe, expect, it } from 'vitest';
import config from '../../vite.components.config';

const external = config.build?.rollupOptions?.external as RegExp[];
const isExternal = (id: string) => external.some((re) => re.test(id));

describe('./components build', () => {
  it("leaves Shoelace to the app's copy", () => {
    expect(isExternal('@shoelace-style/shoelace')).toBe(true);
    expect(
      isExternal('@shoelace-style/shoelace/dist/components/button/button.js'),
    ).toBe(true);
    expect(isExternal('@shoelace-style/shoelace-extra')).toBe(false);
  });
});
