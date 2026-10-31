import { describe, it, expect } from 'vitest';
import { en } from '../../src/i18n/en';
import { id } from '../../src/i18n/id';
import { interpolate } from '../../src/i18n';

describe('Internationalization (i18n)', () => {
  it('has identical structure and complete keys in English and Indonesian dictionaries', () => {
    function getKeys(obj: any, prefix = ''): string[] {
      return Object.keys(obj).reduce((res: string[], k) => {
        const full = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          res.push(...getKeys(obj[k], full));
        } else {
          res.push(full);
        }
        return res;
      }, []);
    }

    const enKeys = getKeys(en).sort();
    const idKeys = getKeys(id).sort();

    expect(enKeys).toEqual(idKeys);
    expect(enKeys.length).toBeGreaterThan(40);
  });

  it('interpolates token parameters correctly', () => {
    const template = 'Tile {completed} of {total}';
    const result = interpolate(template, { completed: 3, total: 10 });
    expect(result).toBe('Tile 3 of 10');
  });

  it('leaves unmatched tokens safe without crashing', () => {
    const template = 'Time: {time}s ({unmatched})';
    const result = interpolate(template, { time: 4.2 });
    expect(result).toBe('Time: 4.2s ({unmatched})');
  });
});
