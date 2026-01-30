import { calculateAdjustedOuts } from '../outs-engine';
import type { BoardFlags } from '../../board-flags.type';
import type { Card } from '../../../interfaces';

describe('outs-engine (v1)', () => {
  it('FD 2x2 en mesa no emparejada -> 9 outs', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: 'K', suit: 'S' },
    ];

    const board: Card[] = [
      { rank: '2', suit: 'S' },
      { rank: '7', suit: 'S' },
      { rank: 'Q', suit: 'D' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'two_tone',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const fd = result.components.find((c) => c.type === 'FLUSH_DRAW');
    expect(fd).toBeDefined();
    expect(fd?.outs).toBe(9);
    expect(result.totalOuts).toBeGreaterThanOrEqual(9);
  });

  it('FD 2x2 en mesa emparejada -> 7 outs', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: 'K', suit: 'S' },
    ];

    const board: Card[] = [
      { rank: 'Q', suit: 'S' },
      { rank: 'Q', suit: 'D' }, // paired
      { rank: '7', suit: 'S' },
    ];

    const flags: BoardFlags = {
      pairedType: 'paired',
      isPaired88Plus: true, // Q pair
      flushState: 'two_tone',
      straightPressure: 'none',
      texture: 'coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);
    const fd = result.components.find((c) => c.type === 'FLUSH_DRAW');

    expect(fd).toBeDefined();
    expect(fd?.outs).toBe(7);
  });

  it('FD 2x2 en double_paired -> 4 outs', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: 'K', suit: 'S' },
    ];

    const board: Card[] = [
      { rank: 'Q', suit: 'S' },
      { rank: 'Q', suit: 'D' },
      { rank: '7', suit: 'S' }, // OJO: aquí no hay doble pareja real, pero flags simulan el caso
    ];

    const flags: BoardFlags = {
      pairedType: 'double_paired',
      isPaired88Plus: true,
      flushState: 'two_tone',
      straightPressure: 'none',
      texture: 'coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);
    const fd = result.components.find((c) => c.type === 'FLUSH_DRAW');

    expect(fd).toBeDefined();
    expect(fd?.outs).toBe(4);
  });

  it('Overcards en super_coordinated -> 0 outs', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'D' },
    ];

    const board: Card[] = [
      { rank: '9', suit: 'S' },
      { rank: 'T', suit: 'D' },
      { rank: 'J', suit: 'H' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'one_card_straight_possible',
      texture: 'super_coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);
    const over = result.components.find((c) => c.type === 'OVER_CARDS');

    // Detecta 2 overcards, pero regla debe dar 0 por super_coordinated
    expect(over).toBeDefined();
    expect(over?.outs).toBe(0);
  });

  it('OESD 2x2 en mesa no emparejada y sin color -> 8 outs', () => {
    const hole: Card[] = [
      { rank: '8', suit: 'H' },
      { rank: '9', suit: 'D' },
    ];

    const board: Card[] = [
      { rank: '6', suit: 'S' },
      { rank: '7', suit: 'C' },
      { rank: 'Q', suit: 'D' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'two_card_straight_possible',
      texture: 'semi_coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);
    const sd = result.components.find((c) => c.type === 'STRAIGHT_DRAW');

    expect(sd).toBeDefined();
    expect(sd?.outs).toBe(8);
  });
});
