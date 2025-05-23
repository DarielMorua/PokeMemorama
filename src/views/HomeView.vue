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
      <h4>Instrucciones:</h4>
      <p>
        Para mostrar al pokémon detrás del Ditto da click en el pokémon deseado, después elige otra
        opción para encontrar el par
      </p>
      <p>Una vez que hayas encontrado todos los pares, el juego te mostrará tu puntaje</p>
    </div>

    <div class="game-setup">
      <h4>Ingresa tu nombre:</h4>
      <input type="text" placeholder="Nombre" v-model="playerName" />

      <!--  region solo se muestra si se ha ingresado un nombre -->
      <div v-show="playerName && !loadingRegions">
        <h4>Selecciona la región:</h4>
        <select v-model="selectedRegion">
          <option disabled value="">Selecciona una región</option>
          <option v-for="region in regions" :key="region.id" :value="region.name">
            {{ region.name }}
          </option>
        </select>
      </div>

      <!-- dificultad -->
      <div v-show="playerName && selectedRegion">
        <h4>Selecciona el nivel de dificultad:</h4>
        <select v-model="selectedDifficulty">
          <option disabled value="">Selecciona dificultad</option>
          <option v-for="difficulty in difficulties" :key="difficulty.id" :value="difficulty.id">
            {{ difficulty.name }} ({{ difficulty.pairs }} pares)
          </option>
        </select>
      </div>

      <!-- boton de inicio -->
      <button @click="startGame" :disabled="!isFormValid" :class="{ disabled: !isFormValid }">
        Iniciar juego
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/store";
import axios from "axios";
import { authStore } from "../stores/authTokenStore";

import { onMounted } from "vue";

const router = useRouter();
const gameStore = useGameStore();
const auth = authStore();

const playerName = ref("");
const selectedRegion = ref("");
const selectedDifficulty = ref("");
const regions = ref([]);
const loadingRegions = ref(true);

onMounted(() => {
  fetchRegions();
  // limpiar token anterior
  auth.clearToken();
});

const fetchRegions = async () => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/region");

    if (response.data && response.data.results) {
      //crear un arreglo con los nuevos objetos (id y nombre) en regions.value
      regions.value = response.data.results.map((region) => ({
        id: region.url.split("/").slice(-2)[0], //se saca el id desde la url
        name: region.name, //se saca el nombre de la region
      }));
    } else {
      regions.value = [];
    }
  } catch (error) {
    console.error("Error fetching regions:", error);
    regions.value = [];
  } finally {
    loadingRegions.value = false;
  }
};

const difficulties = [
  { id: "easy", name: "Fácil", pairs: 6 },
  { id: "medium", name: "Medio", pairs: 10 },
  { id: "hard", name: "Difícil", pairs: 15 },
];

const isFormValid = computed(() => {
  //computed es si cada vez se cambian las variables dentro lo hace automaticamente
  return playerName.value && selectedRegion.value && selectedDifficulty.value;
});

const startGame = () => {
  // buscar dentro de dicitulktades que sea igual a la dificutlad seleciconada
  const selectedDifficultyObj = difficulties.find((d) => d.id === selectedDifficulty.value);

  //crear usuario
  const userData = {
    username: playerName.value,
    region: selectedRegion.value,
    difficulty: selectedDifficulty.value,
    difficultyName: selectedDifficultyObj.name,
    difficultyPairs: selectedDifficultyObj.pairs,
    // id unico para el juego
    gameId: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    startTime: new Date().toISOString(),
  };

  // crear el token con los datos del usuario
  const token = auth.createUserToken(userData);
  console.log("Token JWT generado:", token);

  // decodificar para verificar que se guardo bien
  const decodedToken = auth.decodeToken();
  console.log("Token decodificado:", decodedToken);

  if (!auth.isTokenValid()) {
    console.error("Error: El token no es válido");
    return;
  }

  // guardar información del jugador en el store
  gameStore.setPlayerInfo(playerName.value, selectedRegion.value, selectedDifficultyObj, token);

  // redirigir a la pagina del juego
  router.push("/game");
};
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.logo {
  width: 250px;
  margin-bottom: 20px;
}

h2,
h3 {
  margin: 10px 0;
}

h4 {
  margin: 15px 0 5px 0;
  text-align: left;
}

.instructions,
.game-setup {
  background: #f8f9fa;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  text-align: left;
}

input,
select {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
}

button:hover {
  background: #0056b3;
}

button.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
