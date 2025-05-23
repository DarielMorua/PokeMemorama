<template>
  <div class="app">
    <header>
      <nav>
        <router-link to="/" class="nav-logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg"
            alt="Pokémon"
            class="nav-logo-img"
          />
        </router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <p>Memorama Pokémon &copy; 2025</p>
    </footer>
  </div>
</template>

<script setup></script>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Arial", sans-serif;
}

body {
  background-color: #f8f8f8;
  color: #333;
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #cc0000;
  color: white;
  padding: 10px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

nav {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav-logo-img {
  height: 40px;
}

main {
  flex: 1;
  padding: 20px;
}

footer {
  background-color: #3b4cca;
  color: white;
  text-align: center;
  padding: 15px;
  margin-top: auto;
}

h1,
h2,
h3 {
  margin-bottom: 15px;
}

button {
  cursor: pointer;
}

/* Utilidades */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
