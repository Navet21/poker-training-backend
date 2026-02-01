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
      { rank: '7', suit: 'S' }, // flags simulan double_paired
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

  // ---------------------------
  // ✅ BACKDOOR FLUSH (nut al A)
  // ---------------------------

  it('BDFD nut A en flop unpaired -> 2 outs', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    // 1 carta de pica en flop (K♠) y las otras off → backdoor
    const board: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: '9', suit: 'D' },
      { rank: '2', suit: 'C' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeDefined();
    expect(bdfd?.outs).toBe(2);
  });

  it('BDFD nut A en flop paired -> 1 out', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    // Flop paired (K K) y solo 1 pica → backdoor existe pero vale 1
    const board: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: 'K', suit: 'D' },
      { rank: '2', suit: 'C' },
    ];

    const flags: BoardFlags = {
      pairedType: 'paired',
      isPaired88Plus: true,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeDefined();
    expect(bdfd?.outs).toBe(1);
  });

  it('No BDFD si hay flush draw directo (FD 2x2)', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    // 2 picas en flop + 2 en mano → FD directo, no backdoor
    const board: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: '9', suit: 'S' },
      { rank: '2', suit: 'C' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'two_tone',
      straightPressure: 'none',
      texture: 'semi_coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const fd = result.components.find((c) => c.type === 'FLUSH_DRAW');
    expect(fd).toBeDefined();

    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeUndefined();
  });

  it('No BDFD si no es nut (sin A suited)', () => {
    const hole: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    const board: Card[] = [
      { rank: 'A', suit: 'S' }, // hay 1 pica en flop, pero no tienes As en mano
      { rank: '9', suit: 'D' },
      { rank: '2', suit: 'C' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeUndefined();
  });

  // ---------------------------
  // ✅ BACKDOOR STRAIGHT
  // ---------------------------

  it('BDSD en flop rainbow + unpaired + sin SD directo -> 1 out', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '9', suit: 'D' },
    ];

    const board: Card[] = [
      { rank: '2', suit: 'C' },
      { rank: '5', suit: 'H' },
      { rank: '7', suit: 'D' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const sd = result.components.find((c) => c.type === 'STRAIGHT_DRAW');
    expect(sd).toBeUndefined(); // aquí sí debería ser NONE

    const bdsd = result.components.find((c) => c.type === 'BACKDOOR_STRAIGHT');
    expect(bdsd).toBeDefined();
    expect(bdsd?.outs).toBe(1);
  });

  it('No BDSD si hay proyecto de color en mesa (two_tone)', () => {
    const hole: Card[] = [
      { rank: '7', suit: 'S' },
      { rank: '8', suit: 'D' },
    ];

    const board: Card[] = [
      { rank: 'A', suit: 'C' },
      { rank: '5', suit: 'C' }, // two_tone
      { rank: '6', suit: 'D' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'two_tone',
      straightPressure: 'none',
      texture: 'semi_coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdsd = result.components.find((c) => c.type === 'BACKDOOR_STRAIGHT');
    expect(bdsd).toBeUndefined();
  });

  it('No BDSD si mesa emparejada', () => {
    const hole: Card[] = [
      { rank: '7', suit: 'S' },
      { rank: '8', suit: 'D' },
    ];

    const board: Card[] = [
      { rank: '6', suit: 'C' },
      { rank: '6', suit: 'H' }, // paired
      { rank: 'A', suit: 'D' },
    ];

    const flags: BoardFlags = {
      pairedType: 'paired',
      isPaired88Plus: false, // 6 no es 88+
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdsd = result.components.find((c) => c.type === 'BACKDOOR_STRAIGHT');
    expect(bdsd).toBeUndefined();
  });

  it('No BDSD si hay straight draw directo', () => {
    const hole: Card[] = [
      { rank: '8', suit: 'H' },
      { rank: '9', suit: 'D' },
    ];

    // 6-7-Q con 8-9 es OESD directo
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

    const bdsd = result.components.find((c) => c.type === 'BACKDOOR_STRAIGHT');
    expect(bdsd).toBeUndefined();
  });

  it('No BACKDOOR_FLUSH en turn (solo flop)', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    // Turn: 4 cartas
    const board: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: '9', suit: 'D' },
      { rank: '2', suit: 'C' },
      { rank: '4', suit: 'H' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeUndefined();
  });

  it('No BACKDOOR_STRAIGHT en turn (solo flop)', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '9', suit: 'D' },
    ];

    // Turn: 4 cartas
    const board: Card[] = [
      { rank: '2', suit: 'C' },
      { rank: '5', suit: 'H' },
      { rank: '7', suit: 'D' },
      { rank: 'K', suit: 'S' },
    ];

    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'dry',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    const bdsd = result.components.find((c) => c.type === 'BACKDOOR_STRAIGHT');
    expect(bdsd).toBeUndefined();
  });

  it('Explanation menciona backdoor flush cuando es el único componente relevante', () => {
    const hole: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: '7', suit: 'S' },
    ];

    // Flop con EXACTAMENTE 1 pica (K♠) -> BDFD
    const board: Card[] = [
      { rank: 'K', suit: 'S' },
      { rank: '9', suit: 'D' },
      { rank: '2', suit: 'C' },
    ];

    // Forzamos overcards a 0 para que no meta ruido
    const flags: BoardFlags = {
      pairedType: 'none',
      isPaired88Plus: false,
      flushState: 'rainbow',
      straightPressure: 'none',
      texture: 'super_coordinated',
    };

    const result = calculateAdjustedOuts(hole, board, flags);

    // Aseguramos que NO hay draws directos
    expect(
      result.components.find((c) => c.type === 'FLUSH_DRAW'),
    ).toBeUndefined();
    expect(
      result.components.find((c) => c.type === 'STRAIGHT_DRAW'),
    ).toBeUndefined();

    // Debe existir BDFD
    const bdfd = result.components.find((c) => c.type === 'BACKDOOR_FLUSH');
    expect(bdfd).toBeDefined();
    expect(bdfd?.outs).toBeGreaterThan(0);

    // Y la explicación debe mencionarlo
    // (no dependemos del texto exacto, solo de que lo nombre)
    // Nota: usa includes con una palabra estable.
    const explanation = require('../outs-explanation').buildOutsExplanation(
      result.totalOuts,
      result.components,
      flags,
    );

    expect(explanation.toLowerCase()).toContain('backdoor');
    expect(explanation.toLowerCase()).toContain('color');
  });
});
