import type { BoardFlags } from '../board-flags.type';
import type { OutsComponent } from './outs.types';

function textureLabel(texture: BoardFlags['texture']) {
  switch (texture) {
    case 'dry':
      return 'mesa seca';
    case 'semi_coordinated':
      return 'mesa semicoordinada';
    case 'coordinated':
      return 'mesa coordinada';
    case 'super_coordinated':
      return 'mesa extremadamente coordinada';
  }
}

function overcardValue(flags: BoardFlags) {
  // según tus apuntes:
  // coordinada -> 1
  // extremadamente coordinada -> 0
  // resto -> 2
  if (flags.texture === 'super_coordinated') return 0;
  if (flags.texture === 'coordinated') return 1;

  return 2;
}

function pairedLabel(pairedType: BoardFlags['pairedType']) {
  switch (pairedType) {
    case 'none':
      return 'no emparejada';
    case 'paired':
      return 'emparejada';
    case 'double_paired':
      return 'doblemente emparejada';
    case 'trips':
      return 'con trío';
  }
}

function flushLabel(flushState: BoardFlags['flushState']) {
  switch (flushState) {
    case 'rainbow':
      return 'sin proyecto de color (rainbow)';
    case 'two_tone':
      return 'con dos palos (posible proyecto de color)';
    case 'three_tone':
      return 'con tres cartas del mismo palo (color muy probable)';
  }
}

function straightLabel(straightPressure: BoardFlags['straightPressure']) {
  switch (straightPressure) {
    case 'none':
      return 'poca presión de escalera';
    case 'two_card_straight_possible':
      return 'hay conectividad (posibles proyectos a 2 cartas)';
    case 'one_card_straight_possible':
      return 'mucha conectividad (posibles proyectos a 1 carta)';
  }
}

// Si quieres que suene más "coach", usa esto:
function intro(flags: BoardFlags) {
  const t = textureLabel(flags.texture);
  const p = pairedLabel(flags.pairedType);
  const f = flushLabel(flags.flushState);
  const s = straightLabel(flags.straightPressure);

  return `📌 Estás en una ${t} (${p}), ${f} y ${s}. Vamos a contar outs ajustadas:`;
}

export function buildOutsExplanation(
  totalOuts: number,
  components: OutsComponent[],
  flags: BoardFlags,
): string {
  const textureText = textureLabel(flags.texture);

  // 🟥 CASO 1: 0 outs (humano)
  if (totalOuts === 0) {
    return `Estás en una ${textureText} y no hay outs efectivas detectadas.

No tienes proyectos directos de color ni de escalera en este street, y tus cartas no generan outs rentables según la textura.

👉 Suele ser un spot de baja equity: muchas veces el fold es correcto.`;
  }

  // 🟨 CASO 2: hay outs → humano "apuntes"
  const lines: string[] = [];
  lines.push(intro(flags));

  for (const c of components) {
    if (c.type === 'OVER_CARDS') {
      const v = overcardValue(flags);
      // No sabemos si son 1 o 2 overcards, pero podemos inferirlo:
      // si v = 2 y c.outs = 4 -> 2 overcards; si c.outs = 2 -> 1 overcard.
      // si v = 1 -> outs = #overcards
      // si v = 0 -> outs = 0
      const estimatedCount = v === 0 ? 0 : Math.round(c.outs / Math.max(v, 1));

      lines.push(
        `• Overcards: tienes ${estimatedCount} overcard(s). En ${textureText} valen ${v} ${v === 1 ? 'out' : 'outs'} por overcard → ${c.outs} outs.`,
      );

      if (flags.pairedType !== 'none' && flags.isPaired88Plus) {
        lines.push(
          '  ↳ Ojo: la mesa está emparejada con pareja alta (88+), por lo que las overcards pierden mucho valor.',
        );
      }
      continue;
    }

    if (c.type === 'FLUSH_DRAW') {
      const paired = flags.pairedType !== 'none';
      // Tu regla ajusta: no emparejada 9, emparejada 7, dobles/trips 4, etc.
      // Aquí lo decimos humano, sin soltar el "pairedType=..."
      const pairedText =
        flags.pairedType === 'none'
          ? 'mesa no emparejada'
          : flags.pairedType === 'paired'
            ? 'mesa emparejada'
            : flags.pairedType === 'double_paired'
              ? 'mesa doblemente emparejada'
              : 'mesa con trío';

      lines.push(
        `• Proyecto de color: estás en ${pairedText}, por eso el FD se ajusta → ${c.outs} outs.`,
      );
      continue;
    }

    if (c.type === 'STRAIGHT_DRAW') {
      // Humanizamos según presión / flushState / pairedType
      const hasFlushPressure = flags.flushState !== 'rainbow';
      const isPaired = flags.pairedType !== 'none';

      const contextParts: string[] = [];
      if (isPaired) contextParts.push('la mesa está emparejada');
      if (hasFlushPressure) contextParts.push('hay proyecto de color');
      if (!contextParts.length)
        contextParts.push('mesa limpia (sin color y no emparejada)');

      lines.push(
        `• Proyecto de escalera: como ${contextParts.join(' y ')}, el proyecto pierde algo de valor → ${c.outs} outs.`,
      );
      continue;
    }
  }

  lines.push(`\nTotal: ${totalOuts} outs ajustadas.`);
  return lines.join('\n');
}
