# 🧠 Board Lab — Outs Engine (Backend)

Este proyecto implementa un **motor de cálculo de outs ajustadas** orientado al **entrenamiento real de poker**, no a la simulación masiva ni al cálculo exacto de equity.

El objetivo es ayudar al jugador a:

- Identificar correctamente proyectos
- Entender **por qué valen lo que valen**
- Tomar mejores decisiones en mesa (call / raise / fold)

El sistema está diseñado para **enseñar a pensar**, no para devolver números sin contexto.

---

## 🎯 Filosofía del motor

Este motor sigue un enfoque **heurístico y pedagógico**, inspirado en metodología de coaching.

- ❌ No busca calcular equity exacta
- 🧠 Prioriza el razonamiento sobre el resultado
- ⚠️ Penaliza proyectos débiles en mesas peligrosas
- 🚫 Refuerza la identificación de spots sin equity
- 📚 Explica el _por qué_ detrás de cada decisión

No es una calculadora. Es una herramienta de aprendizaje.

---

## 🧩 Cálculo por componentes

Las outs se calculan de forma **modular**, separando cada fuente de equity:

- Overcards
- Proyectos de color
- Proyectos de escalera
- Backdoors realistas  
  (color y escalera, solo en flop)

Cada componente se evalúa de forma independiente y luego se **ajusta dinámicamente** según el contexto del board.

---

## ⚙️ Ajustes dinámicos según el board

Las outs se ajustan automáticamente teniendo en cuenta:

### 🟢 Textura del board

- Seca
- Semi-coordinada
- Coordinada
- Extremadamente coordinada

### 🟡 Mesas emparejadas

- Pareja simple
- Doble pareja
- Trío

### 🔵 Presión de color

- Rainbow
- Two-tone
- Three-tone

### 🔴 Presión de escalera

- Conectividad a dos cartas
- Conectividad a una carta

Este enfoque evita el error clásico de contar siempre **outs teóricas** sin considerar el peligro real del spot.

---

## 💬 Explicaciones humanas

El motor **no devuelve solo un número**.

Cada respuesta incluye una explicación en lenguaje natural que detalla:

- Qué proyectos están activos
- Por qué valen más o menos
- Cómo afecta la textura del board
- Cuándo un proyecto pierde valor
- Cuándo el spot es simplemente un **fold**

El objetivo es simular el razonamiento de un coach, no el output de una calculadora.

---

## 🧪 Testing y fiabilidad

El motor está cubierto por tests unitarios que validan:

- Cálculo correcto de outs por componente
- Ajustes en mesas emparejadas
- Comportamiento en texturas extremas
- Activación y bloqueo correcto de backdoors
- Coherencia entre lógica y explicación

Esto garantiza que el sistema sea **estable, extensible y fiable** a medida que se añadan nuevas funcionalidades.

---

## 🛣️ Roadmap

El motor actual se mantiene estable mientras se planifican nuevas capas de entrenamiento:

- Evaluación de fuerza de mano (_hand strength_)
- Integración de equity aproximada (enfoque pedagógico)
- Nuevos entrenadores:
  - ¿Quién va por delante?
  - ¿Cuánta equity tengo realmente?
  - Entrenamiento de sizing y toma de decisiones

El diseño actual permite crecer sin romper la lógica existente.

---

## 🧠 Nota final

Board Lab no pretende sustituir solvers ni herramientas profesionales.
Su propósito es cubrir el espacio entre **saber teoría** y **aplicarla correctamente en mesa**.
