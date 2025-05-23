import { defineStore } from "pinia";

export const useGameStore = defineStore("game", {
  state: () => ({
    playerName: "",
    region: "",
    difficulty: "",
    authToken: null,
    scores: [],
    lastScore: null,
  }),
  actions: {
    setPlayerInfo(name, region, difficulty, authToken) {
      this.playerName = name;
      this.region = region;
      this.difficulty = difficulty;
      this.authToken = authToken;
    },
    setLastScore(scoreData) {
      this.lastScore = scoreData;
    },
    getLastScore() {
      return this.lastScore;
    },
  },
  getters: {},
});
