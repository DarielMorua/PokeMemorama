<template>
  <div class="game-view">
    <div class="game-header">
      <h1>Memorama Pokémon - {{ store.playerName }}</h1>
      <div class="game-info">
        <p><strong>Región:</strong> {{ store.region }}</p>
        <p><strong>Dificultad:</strong> {{ store.difficulty.name }}</p>
        <p><strong>Tiempo:</strong> {{ formatTime(tiempo) }}</p>
        <p><strong>Pares encontrados:</strong> {{ paresIguales }} / {{ paresTotales }}</p>
      </div>
    </div>

    <div class="game-board" :class="difficultyClass">
      <PokemonCard
        v-for="card in cards"
        :key="card.uniqueId"
        :pokemon="card"
        :is-flipped="cartasVolteadas.includes(card.uniqueId) || cartasIguales.includes(card.id)"
        :is-match="cartasIguales.includes(card.id)"
        @card-flipped="flipCard(card)"
      />
    </div>

    <div v-if="juegoTerminado" class="game-completed">
      <h2>¡Felicidades! Has completado el juego</h2>
      <p>Tu tiempo: {{ formatTime(tiempoFinal) }}</p>
      <div class="buttons">
        <button @click="jugarDeNuevo" class="btn-play-again">Jugar de nuevo</button>
        <button @click="verPuntajes" class="btn-view-scores">Ver puntajes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/store";
import PokemonCard from "../components/PokemonCard.vue";

const router = useRouter();
const store = useGameStore();

if (!store.isAuthenticated) {
  router.push("/");
}

const cards = ref([]);
const cartasVolteadas = ref([]);
const cartasIguales = ref([]);
const juegoTerminado = ref(false);
const tiempo = ref(0);
const tiempoFinal = ref(0);
const timer = ref(null);
const bloqueado = ref(false);

const paresTotales = computed(() => store.difficulty?.pairs || 0);
const paresIguales = computed(() => cartasIguales.value.length / 2);

const difficultyClass = computed(() => {
  const id = store.difficulty?.id;
  if (id === "easy") return "easy-grid";
  if (id === "medium") return "medium-grid";
  if (id === "hard") return "hard-grid";
  return "";
});

onMounted(async () => {
  await cargarCartas();
  iniciarTemporizador();
});

onUnmounted(() => {
  clearInterval(timer.value);
});

watch(paresIguales, (nuevos) => {
  if (nuevos === paresTotales.value && nuevos > 0) {
    terminarJuego();
  }
});

async function cargarCartas() {
  const regiones = {
    Kanto: { start: 1, end: 151 },
    Johto: { start: 152, end: 251 },
    Hoenn: { start: 252, end: 386 },
    Sinnoh: { start: 387, end: 493 },
    Unova: { start: 494, end: 649 },
  };

  const rango = regiones[store.region] || regiones["Kanto"];

  const ids = new Set();
  while (ids.size < paresTotales.value) {
    const id = Math.floor(Math.random() * (rango.end - rango.start + 1)) + rango.start;
    ids.add(id);
  }

  const datos = await Promise.all(
    [...ids].map(async (id) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        image:
          data.sprites.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    })
  );

  const duplicadas = datos.flatMap((p) => [
    { ...p, uniqueId: `${p.id}-A` },
    { ...p, uniqueId: `${p.id}-B` },
  ]);

  cards.value = duplicadas.sort(() => Math.random() - 0.5);
}

function iniciarTemporizador() {
  timer.value = setInterval(() => {
    tiempo.value++;
  }, 1000);
}
function flipCard(card) {
  if (
    bloqueado.value ||
    cartasIguales.value.includes(card.id) ||
    cartasVolteadas.value.includes(card.uniqueId)
  ) {
    return;
  }

  cartasVolteadas.value.push(card.uniqueId);

  if (cartasVolteadas.value.length === 2) {
    bloqueado.value = true;
    const [a, b] = cartasVolteadas.value.map((id) => id.split("-")[0]);

    if (a === b) {
      cartasIguales.value.push(Number(a));
      cartasVolteadas.value = [];
      bloqueado.value = false;
    } else {
      setTimeout(() => {
        cartasVolteadas.value = [];
        bloqueado.value = false;
      }, 1000);
    }
  }
}

function formatTime(segundos) {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function terminarJuego() {
  clearInterval(timer.value);
  tiempoFinal.value = tiempo.value;
  juegoTerminado.value = true;

  const puntaje = Math.max(10000 - tiempo.value * 10, 0);
  store.addScore({
    score: puntaje,
    time: tiempo.value,
    date: new Date().toISOString(),
  });
}

function jugarDeNuevo() {
  router.push("/");
}

function verPuntajes() {
  router.push("/scores");
}
</script>

<style scoped>
.game-view {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.game-header h1 {
  font-size: 22px;
  color: #3b4cca;
  margin: 0 0 10px;
}

.game-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
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

@media (max-width: 600px) {
  .easy-grid,
  .medium-grid,
  .hard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.game-completed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffffcc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.game-completed h2 {
  color: #cc0000;
  font-size: 28px;
  margin-bottom: 15px;
}

.game-completed p {
  font-size: 18px;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 15px;
}

button {
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-play-again {
  background-color: #3b4cca;
  color: white;
}

.btn-view-scores {
  background-color: #ffde00;
  color: #3b4cca;
}
</style>
