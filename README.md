# Cálculo de Outs — Motor de Entrenamiento de Poker

Este proyecto implementa un motor de cálculo de outs ajustadas orientado al entrenamiento real de poker, no a la simulación ni al cálculo exacto de equity.

El objetivo principal es ayudar al jugador a identificar correctamente proyectos, entender por qué valen lo que valen y tomar mejores decisiones en mesa (call, raise o fold).

## Enfoque del sistema

El motor sigue un enfoque heurístico y pedagógico, inspirado en metodología de coaching:

No busca calcular equity exacta.

Prioriza el razonamiento sobre el resultado.

Penaliza proyectos débiles en mesas peligrosas.

Refuerza la identificación de spots sin equity.

El sistema enseña a pensar, no solo a contar.

## Cálculo por componentes

Las outs se calculan de forma modular, separando cada fuente de equity:

Overcards

Proyectos de color

Proyectos de escalera

Backdoors realistas (color y escalera, solo en flop)

Cada componente se evalúa de forma independiente y luego se ajusta según el contexto del board.

## Ajustes dinámicos según el board

Las outs se ajustan automáticamente teniendo en cuenta:

Textura del board

seca

semicoordinada

coordinada

extremadamente coordinada

Mesas emparejadas

pareja simple

doble pareja

trío

Presión de color

rainbow

two-tone

three-tone

Presión de escalera

conectividad a dos cartas

conectividad a una carta

Esto evita el error común de contar siempre “outs teóricas” sin considerar el peligro real del spot.

#Explicaciones humanas

El motor no devuelve solo un número.

Cada resultado incluye una explicación en lenguaje natural, pensada para que el usuario entienda:

qué proyectos tiene

por qué valen más o menos

cómo afecta la textura del board

cuándo un proyecto pierde valor

cuándo un spot es simplemente un fold

El objetivo es simular el razonamiento de un coach, no el output de una calculadora.

#Testing y fiabilidad

El motor está cubierto por tests unitarios que validan:

cálculo correcto de outs por componente

ajustes en mesas emparejadas

comportamiento en texturas extremas

activación y bloqueo correcto de backdoors

coherencia entre lógica y explicación

Esto garantiza que el sistema sea estable, extensible y fiable a medida que se añadan nuevas funcionalidades.

## Próximas mejoras (roadmap)

El backend se mantiene estable mientras se planifican nuevas capas de entrenamiento:

Evaluación de fuerza de mano (hand strength) según board

Integración de equity aproximada

Nuevos entrenadores:

“¿Quién va por delante?”

“¿Cuánta equity tengo realmente?”

Entrenamiento de sizing y toma de decisiones

El motor actual está diseñado para crecer sin romper la lógica existente.
