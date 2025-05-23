<template>
  <div class="game-view">
    <div class="game-header">
      <h1>Memorama Pokémon - {{ store.playerName }}</h1>
      <div class="game-info">
        <span><strong>Región:</strong> {{ store.region }}</span>
        <span><strong>Dificultad:</strong> {{ store.difficulty.name }}</span>
        <span v-if="gameTime"><strong>Tiempo:</strong> {{ formattedTime }}</span>
        <span><strong>Clicks:</strong> {{ clickCount }}</span>
      </div>
    </div>

    <div v-if="isAuthenticated" class="game-board" :class="difficultyClass">
      <PokemonCard
        v-for="card in cards"
        :key="card.uniqueId"
        :pokemon="card"
        :is-flipped="cartasVolteadas.includes(card.uniqueId) || cartasIguales.includes(card.id)"
        :is-match="cartasIguales.includes(card.id)"
        @card-flipped="flipCard(card)"
      />
    </div>

    <div v-else class="auth-error">
      <h2>Error de autenticación</h2>
      <p>Tu sesión no es válida o ha expirado</p>
      <button @click="goToHome">Volver al inicio</button>
    </div>

    <div v-if="isGameCompleted" class="game-completed">
      <h2>¡Felicidades! Has completado el juego</h2>
      <p>Encontraste todos los pares en {{ formattedTime }}</p>
      <div class="buttons">
        <button @click="playAgain">Jugar de nuevo</button>
        <button @click="viewScores">Ver puntuaciones</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/store";
import { authStore } from "../stores/authTokenStore";
import PokemonCard from "../components/PokemonCard.vue";

const router = useRouter();
const store = useGameStore();
const auth = authStore();

const cards = ref([]);
const cartasVolteadas = ref([]);
const cartasIguales = ref([]);
const timer = ref(null);
const gameTime = ref(0);
const bloqueado = ref(false);
const isAuthenticated = ref(false);
const isGameCompleted = ref(false);

//dentro del store de la dificultad se agarra los pares, si no aparece se vuelve 0
const paresTotales = computed(() => store.difficulty?.pairs || 0);

//si la dificultdad es facil devuelve el grid facil, y asi sucesivamente
const difficultyClass = computed(() => {
  const id = store.difficulty?.id;
  if (id === "easy") return "easy-grid";
  if (id === "medium") return "medium-grid";
  if (id === "hard") return "hard-grid";
  return "";
});

//formato de tiempo correcto
const formattedTime = computed(() => {
  const minutes = Math.floor(gameTime.value / 60);
  const seconds = gameTime.value % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

onMounted(async () => {
  // verificar el token JWT
  if (auth.isTokenValid()) {
    //si tiene token valido carga las tarjetas y comienza el timer
    isAuthenticated.value = true;

    await cargarCartas();
    startTimer();
  } else {
    console.error("Token no válido o expirado");
    isAuthenticated.value = false;
  }
});

// limpiar temporizador al desmontar
onUnmounted(() => {
  clearInterval(timer.value);
});

/* observar cuando se encuentran todos los pares
watch mira los ref y reacciona segun el valor nuevk, esta observando cartasIguales que son lo que el usuario a encontrado bien*/
watch(
  cartasIguales,
  (newValue) => {
    //cuando el ususario encuentra un nuevo par bien agrega la cantidad de aciertos a newValue y lo compara con paresTotales

    if (newValue.length === paresTotales.value) {
      gameCompleted();
    }
  },
  { deep: true }
);

function startTimer() {
  timer.value = setInterval(() => {
    gameTime.value++;
  }, 1000);
}

async function cargarCartas() {
  const regiones = {
    kanto: { start: 1, end: 151 },
    johto: { start: 152, end: 251 },
    hoenn: { start: 252, end: 386 },
    sinnoh: { start: 387, end: 493 },
    unova: { start: 494, end: 649 },
    kalos: { start: 650, end: 721 },
    alola: { start: 722, end: 809 },
    galar: { start: 810, end: 898 },
  };

  //si no existe la region, se usa KANTO
  const rango = regiones[store.region.toLowerCase()] || regiones["kanto"];
  /*genera u numero random dentro del rango de la region, se pone en set y esto es  para que no haya duplicados
  se repite hasta que tenga los mismos que paresTotales*/
  const ids = new Set();
  while (ids.size < paresTotales.value) {
    const id = Math.floor(Math.random() * (rango.end - rango.start + 1)) + rango.start;
    ids.add(id);
  }

  //promiseall para hacer todas las peticiones al mismo timempo, crea objetos id name e image
  const datos = await Promise.all(
    [...ids].map(async (id) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();
        return {
          id: data.id,
          name: data.name,
          image:
            data.sprites.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
      } catch (error) {
        console.error(`Error al cargar el Pokémon ${id}:`, error);
        return {
          id: id,
          name: `pokemon-${id}`,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
      }
    })
  );

  /*cada carta se duplica con su ID y luego con A y otro con su ID y luego con B para poder emparejarlas y no se hagan overlap
  el ...p es spread operator hace que copie todas las propiedades del pokemon como id nombre y eso
  flatmap hace que cada pokemon se mapee a un array con los ID A y B*/
  const duplicadas = datos.flatMap((p) => [
    { ...p, uniqueId: `${p.id}-A` },
    { ...p, uniqueId: `${p.id}-B` },
  ]);

  //las pone en lugares aleatorios antes de mostrarlos, se guardan en cards para que puedan ser renderizados
  cards.value = duplicadas.sort(() => Math.random() - 0.5);
}
const clickCount = ref(0);

function flipCard(card) {
  //ignorar click si el juego esta comparando dos cartas, o si ya se encontraron o si estan volteadas enb ese momento
  if (
    bloqueado.value ||
    cartasIguales.value.includes(card.id) ||
    cartasVolteadas.value.includes(card.uniqueId)
  ) {
    return;
  }

  // incrementar contador de clics
  clickCount.value++;

  //agregar el id que creamos con A y B en cartasVolteadas
  cartasVolteadas.value.push(card.uniqueId);

  //si hay dos cartas volteadas se bloquea el tablero para que el jugador no pueda dar m[as clicks]
  if (cartasVolteadas.value.length === 2) {
    bloqueado.value = true;
    //se comparan los ids reales para ver si son iguales, se usa split para separar el id de la letra A o B
    const [a, b] = cartasVolteadas.value.map((id) => id.split("-")[0]);

    /*se guara el id en cartas iguales si son iguales
    se limpian las cartas volteadas para que el jugador pueda seguir jugando
    se desbloquea el tablero*/
    if (a === b) {
      cartasIguales.value.push(Number(a));
      cartasVolteadas.value = [];
      bloqueado.value = false;
    } else {
      //si no, se espera 1 segundo para que el jugador pueda ver las cartas luego las oculta haciendo que cartasVolteadas se vacie
      //se desbloquea el tablero
      setTimeout(() => {
        cartasVolteadas.value = [];
        bloqueado.value = false;
      }, 1000);
    }
  }
}

function gameCompleted() {
  //detuebe el cronometro y marca el juego como completado
  clearInterval(timer.value);
  isGameCompleted.value = true;
  //prepara el objeto score para guardar la puntuacion
  const score = {
    playerName: store.playerName,
    region: store.region,
    difficulty: store.difficulty.name,
    clicks: clickCount.value,
    date: new Date().toISOString(),
  };

  console.log("Juego completado:", score);

  // guardar la puntuación en localStorage agregando la nueva puntuacion y se guarda como un array de json
  const savedScores = localStorage.getItem("pokemonMemoryScores") || "[]";
  const scores = JSON.parse(savedScores);
  scores.push(score);
  localStorage.setItem("pokemonMemoryScores", JSON.stringify(scores));

  // guardar en el store para mostrarla en ScoresView
  store.setLastScore(score);
}

function playAgain() {
  router.push("/");
}

function viewScores() {
  router.push("/scores");
}

function goToHome() {
  router.push("/");
}
</script>

<style scoped>
.game-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.game-header {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.game-header h1 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.game-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.game-info span {
  font-size: 14px;
}

.game-board {
  display: grid;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.easy-grid {
  grid-template-columns: repeat(4, 1fr);
}

.medium-grid {
  grid-template-columns: repeat(5, 1fr);
}

.hard-grid {
  grid-template-columns: repeat(6, 1fr);
}

.auth-error {
  text-align: center;
  background: #f8d7da;
  padding: 20px;
  border-radius: 8px;
  margin: 40px auto;
  max-width: 500px;
}

.auth-error h2 {
  color: #721c24;
  margin-bottom: 15px;
}

.game-completed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.game-completed h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.game-completed p {
  font-size: 16px;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 15px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #0056b3;
}

@media (max-width: 600px) {
  .easy-grid,
  .medium-grid,
  .hard-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .game-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
