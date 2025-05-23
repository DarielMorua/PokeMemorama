<template>
  <div class="scores-view">
    <div class="scores-header">
      <h1>Puntuaciones - Memorama Pokémon</h1>
      <div class="filters">
        <select v-model="selectedDifficulty">
          <option value="">Todas las dificultades</option>
          <option value="easy">Fácil</option>
          <option value="medium">Medio</option>
          <option value="hard">Difícil</option>
        </select>

        <select v-model="selectedRegion">
          <option value="">Todas las regiones</option>
          <option v-for="region in availableRegions" :key="region" :value="region">
            {{ region.charAt(0).toUpperCase() + region.slice(1) }}
          </option>
        </select>
      </div>
    </div>

    <div class="scores-container">
      <div v-if="filteredScores.length > 0" class="scores-table">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Jugador</th>
              <th>Región</th>
              <th>Dificultad</th>
              <th>Clicks</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(score, index) in filteredScores"
              :key="index"
              :class="{ 'current-player': isCurrentPlayer(score) }"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ score.playerName }}</td>
              <td>{{ score.region }}</td>
              <td>{{ getDifficultyName(score.difficulty) }}</td>
              <td>{{ score.clicks }}</td>
              <td>{{ formatDate(score.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="no-scores">
        <p>No hay puntuaciones disponibles</p>
      </div>
    </div>

    <div class="scores-actions">
      <button @click="playAgain">Jugar de nuevo</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/store";
import { authStore } from "../stores/authTokenStore";

const router = useRouter();
const gameStore = useGameStore();
const auth = authStore();

const difficulties = [
  { id: "easy", name: "Fácil", pairs: 6 },
  { id: "medium", name: "Medio", pairs: 10 },
  { id: "hard", name: "Difícil", pairs: 15 },
];

// obtener el nombre en español de la dificultad
const getDifficultyName = (difficultyId) => {
  const difficulty = difficulties.find((d) => d.id === difficultyId || d.name === difficultyId);
  return difficulty ? difficulty.name : difficultyId;
};

const scores = ref([]);
const selectedDifficulty = ref("");
const selectedRegion = ref("");
const currentPlayerName = ref("");

onMounted(() => {
  loadScores();
  // otener nombre del jugador actual del token
  if (auth.isTokenValid()) {
    const decodedToken = auth.decodeToken();
    currentPlayerName.value = decodedToken?.username || gameStore.playerName;
  } else {
    currentPlayerName.value = gameStore.playerName;
  }
});

// acrgar puntuaciones, si hay datos en localStorage los carga, si no carga un arreglo vacío y agrega el ultimo score del juego
const loadScores = () => {
  const savedScores = localStorage.getItem("pokemonMemoryScores");

  scores.value = JSON.parse(savedScores);

  // Si hay una puntuación en el store (juego recién completado), agregarla
  const lastScore = gameStore.getLastScore();
  if (lastScore) {
    scores.value.push(lastScore);
  }
};

// agarra las regiones que se han jugado nada mas de los scores
const availableRegions = computed(() => {
  const regions = new Set(scores.value.map((score) => score.region).filter(Boolean));
  return Array.from(regions).sort();
});

//  ordena los scores por numero de clics menor a mayor y aplica filtros de region y dificultad si estan seleccionados
const filteredScores = computed(() => {
  let filtered = [...scores.value];

  if (selectedDifficulty.value) {
    filtered = filtered.filter((score) => {
      //  nombre en español de la dificultad seleccionada
      const selectedDifficultyName = getDifficultyName(selectedDifficulty.value);
      // comparar con la dificultad guardada en el score
      const scoreDifficulty = score.difficulty || "";
      return scoreDifficulty === selectedDifficultyName;
    });
  }
  // comparar con la region guardada en el score y la seleccionada
  if (selectedRegion.value) {
    filtered = filtered.filter((score) => {
      const scoreRegion = score.region?.toLowerCase() || "";
      const selectedReg = selectedRegion.value.toLowerCase();
      return scoreRegion === selectedReg;
    });
  }

  // ordenar por clicks menor es mejor
  return filtered.sort((a, b) => a.clicks - b.clicks);
});

// resalta la fila del jugador actual en la tabla.
const isCurrentPlayer = (score) => {
  return score.playerName.toLowerCase() === currentPlayerName.value.toLowerCase();
};

// formatear fecha bien
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const playAgain = () => {
  router.push("/");
};
</script>

<style scoped>
.scores-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.scores-header {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.scores-header h1 {
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 24px;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-width: 160px;
}

.scores-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.scores-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th,
td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: bold;
  font-size: 14px;
}

tbody tr:hover {
  background: #f8f9fa;
}

.current-player {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.current-player:hover {
  background: #fff3cd;
}

.no-scores {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.scores-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: center;
  }

  .filters select {
    width: 100%;
    max-width: 300px;
  }

  th,
  td {
    padding: 8px 4px;
    font-size: 14px;
  }
}
</style>
