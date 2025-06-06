<template>
  <div class="pokemon-card" :class="{ flipped: isFlipped }" @click="handleClick">
    <div class="card-content">
      <template v-if="isFlipped || isMatch">
        <img :src="pokemon.image" :alt="pokemon.name" />
        <p>{{ pokemon.name }}</p>
      </template>
      <template v-else>
        <img
          src="https://res.cloudinary.com/dbkv7w2jf/image/upload/v1748998620/132_c8kh6z.png"
          alt="Carta oculta"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
// se espera que el componente reciba un objeto pokemon y dos booleanos isFlipped e isMatch
const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  isFlipped: {
    type: Boolean,
    required: true,
  },
  isMatch: {
    type: Boolean,
    default: false,
  },
});

// se define un evento que se emitirá cuando la carta sea clickeada
const emit = defineEmits(["card-flipped"]);
// se define una funcion que maneja el evento de clic en la carta la cual hace que la carta se voltee
function handleClick() {
  if (!props.isFlipped && !props.isMatch) {
    emit("card-flipped");
  }
}
</script>

<style scoped>
.pokemon-card {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background-color: #ffcb05;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pokemon-card.flipped {
  background-color: #ffffff;
}

.card-content {
  text-align: center;
}

img {
  max-width: 80px;
  max-height: 80px;
}

p {
  margin-top: 8px;
  font-weight: bold;
  text-transform: capitalize;
  font-size: 14px;
}
</style>
