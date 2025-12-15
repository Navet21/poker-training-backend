import { BoardTexture } from '../types';

export function getTextureHelp(texture: BoardTexture): string {
  switch (texture) {
    case 'super_coordinated':
      return 'Mesa extremadamente coordinada: se completa escalera o color con UNA sola carta...';
    case 'coordinated':
      return 'Mesa coordinada: proyectos claros de color (3+) o escalera muy conectada...';
    case 'semi_coordinated':
      return 'Mesa semicoordinada: cartas algo conectadas, pero no tanto como coordinada...';
    case 'dry':
    default:
      return 'Mesa seca: cartas separadas, pocos proyectos fuertes.';
  }
}
