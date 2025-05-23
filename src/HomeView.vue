<template>
  <div class="home">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg"
      alt="Pokémon"
      class="logo"
    />

    <h2>¿Eres el mejor maestro Pokémon del mundo?</h2>
    <h3>¡Encuentra todos los pokémons ocultos y demuéstralo!</h3>

    <div class="instructions">
      <h1>Instrucciones:</h1>
      <p>
        Para mostrar al pokémon detrás del Ditto da click en el pokémon deseado, después elige otra
        opción para encontrar el par
      </p>
      <p>Una vez que hayas encontrado todos los pares, el juego te mostrará tu puntaje</p>
    </div>

    <!-- formulario de inicio -->
    <div class="game-setup">
      <!-- campo para nombre  usando v-model para enlazar con la variable playerName -->
      <h1>Ingresa tu nombre:</h1>
      <input type="text" placeholder="Nombre" v-model="playerName" />

      <!-- selector de reigon  solo se muestra si se ha ingresado un nombre -->
      <div v-show="playerName">
        <h1>Selecciona la región:</h1>
        <select v-model="selectedRegion">
          <option disabled value="">Selecciona una región</option>
          <option v-for="region in regions" :key="region.id" :value="region.name">
            {{ region.name }}
          </option>
        </select>
      </div>

      <!-- selector de dificultad solo se muestra si se ha seleccionado reigon -->
      <div v-show="playerName && selectedRegion">
        <h1>Selecciona el nivel de dificultad:</h1>
        <select v-model="selectedDifficulty">
          <option disabled value="">Selecciona dificultad</option>
          <option v-for="difficulty in difficulties" :key="difficulty.id" :value="difficulty">
            {{ difficulty.name }} ({{ difficulty.pairs }} pares)
          </option>
        </select>
      </div>

      <button @click="startGame">Iniciar juego</button>
    </div>

    <div class="card">
      <p>¡Bienvenido a la búsqueda de pokémons!</p>
      <p>¡Haz clic en el botón para comenzar!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "./stores/store";

const router = useRouter();
const gameStore = useGameStore();

// variables para el formulario
const playerName = ref("");
const selectedRegion = ref("");
const selectedDifficulty = ref("");
//sacar regiones de la api y no dejar que pueda hacer algo  hasta que carguen de la api
// const regions = ref([]);
// const difficulties = ref([]);
// const fetchRegions = async () => {
//   const response = await fetch("https://pokeapi.co/api/v2/region");
//   const data = await response.json();
//   regions.value = data.results;
// };

const regions = [
  { id: 1, name: "Kanto" },
  { id: 2, name: "Johto" },
  { id: 3, name: "Hoenn" },
  { id: 4, name: "Sinnoh" },
  { id: 5, name: "Unova" },
];

const difficulties = [
  { id: "easy", name: "Fácil", pairs: 6 },
  { id: "medium", name: "Medio", pairs: 10 },
  { id: "hard", name: "Difícil", pairs: 15 },
];

//   iniciar el juego
const startGame = () => {
  // guardar información del jugador en el store
  gameStore.setPlayerInfo(playerName.value, selectedRegion.value, selectedDifficulty.value);

  // navegar a la pantalla del juego
  router.push("/game");
};
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 300px;
  margin-bottom: 20px;
}

h2 {
  color: #3b4cca;
  font-size: 24px;
  margin-bottom: 10px;
  text-align: center;
}

h3 {
  color: #ffde00;
  font-size: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.instructions {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 30px;
  width: 100%;
}

.instructions h1 {
  color: #cc0000;
  font-size: 20px;
  margin-bottom: 10px;
}

.game-setup {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  width: 100%;
}

.game-setup h1 {
  color: #3b4cca;
  font-size: 18px;
  margin-bottom: 10px;
}

input,
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #3b4cca;
  border-radius: 5px;
  font-size: 16px;
  color: #333;
}

button {
  background-color: #cc0000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 10px;
}

button:hover {
  background-color: #ff0000;
}

button.disabled {
  background-color: #999;
  cursor: not-allowed;
}

.card {
  background-color: #ffde00;
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  text-align: center;
}

.card p {
  margin: 5px 0;
  font-size: 16px;
  color: #3b4cca;
}
</style>
