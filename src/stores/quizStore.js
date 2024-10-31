import { defineStore } from 'pinia';

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    score: 0,
    highScores: [],
  }),
  actions: {
    incrementScore() {
      this.score++;
    },
    resetScore() {
      this.score = 0;
    },
    saveScore(score) {
      this.highScores.push(score);
      this.highScores.sort((a, b) => b - a);
      this.highScores = this.highScores.slice(0, 5);
    },
    loadHighScores() {
      this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    },
  }
});
