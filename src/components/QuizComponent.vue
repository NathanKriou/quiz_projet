<template>
  <div id="app">
    <h1>Quiz de Culture Générale</h1>

    <div v-if="!quizStarted">
      <div>
        <label for="difficulty">Difficulté :</label>
        <select v-model="selectDifficulty" id="difficulty">
          <option value="easy">Facile</option>
          <option value="medium">Moyenne</option>
          <option value="hard">Difficile</option>
        </select>
      </div>
      <div>
        <label for="theme">Thème :</label>
        <select v-model="selectTheme" id="theme">
                <option value="20">Mythologie</option>
                <option value="21">Sport</option>
                <option value="22">Géographie</option>
                <option value="23">Histoire</option>
            </select>
      </div>
      <button @click="startQuiz">Commencer le Quiz</button>
    </div>

    <div v-else>
      <div class="timer">Temps restant : {{ timer }} secondes</div>
      <h3 v-if="currentQuestion">Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}</h3>
      
      <fieldset v-if="currentQuestion">
        <legend>{{ currentQuestion.question }}</legend>
        
        <div v-for="(answer, index) in allAnswers" :key="index">
          <input
            type="radio"
            :id="'answer-' + index"
            name="answer"
            :value="answer"
            v-model="selectedAnswer"
          />
          <label :for="'answer-' + index">{{ answer }}</label>
        </div>
      </fieldset>

      <button @click="validateAnswer" :disabled="!selectedAnswer">Valider</button>
      <div v-if="showResult" class="showResult">{{ resultMessage }}</div>
      
      <!-- Affichage du score -->
      <div class="score">Score actuel : {{ quizStore.score }}</div>
    </div>
  </div>
</template>

<script>
import { useQuizStore } from '@/stores/quizStore';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const quizStore = useQuizStore();
    return { quizStore };
  },
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      showResult: false,
      resultMessage: '',
      selectedAnswer: '',
      timer: 10,
      interval: null,
      selectDifficulty: 'easy',
      selectTheme: '20',
      quizStarted: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    allAnswers() {
      if (!this.currentQuestion) return [];
      const answers = [...this.currentQuestion.incorrect_answers, this.currentQuestion.correct_answer];
      return answers.sort(() => Math.random() - 0.5);
    }
  },
  methods: {
    fetchQuestions() {
      fetch(`https://opentdb.com/api.php?amount=10&category=${this.selectTheme}&difficulty=${this.selectDifficulty}`)
        .then(response => response.json())
        .then(data => {
          this.questions = data.results.map(question => {
            return {
              ...question,
              question: this.replaceChar(question.question),
              incorrect_answers: question.incorrect_answers.map(answer => this.replaceChar(answer)),
              correct_answer: this.replaceChar(question.correct_answer),
            };
          });
          if (this.questions.length > 0) {
            this.startTimer();
          } else {
            this.resultMessage = 'Aucune question disponible.';
          }
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des questions:', error);
          this.resultMessage = 'Erreur lors de la récupération des questions.';
        });
    },
    replaceChar(str) {
      return str
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&rdquo;/g, '”');
    },
    validateAnswer() {
      clearInterval(this.interval);
      if (this.selectedAnswer === this.currentQuestion.correct_answer) {
        this.quizStore.incrementScore();
        this.resultMessage = 'Bonne réponse !';
      } else {
        this.resultMessage = 'Mauvaise réponse !';
      }
      this.showResult = true;

      setTimeout(() => {
        this.nextQuestion();
      }, 2000);
    },
    nextQuestion() {
      this.currentQuestionIndex++;
      this.showResult = false;
      this.selectedAnswer = '';
      this.resetTimer();

      if (this.currentQuestionIndex < this.questions.length) {
        this.startTimer();
      } else {
        this.quizStore.saveScore(this.quizStore.score);
        this.quizStore.loadHighScores();
      }
    },
    startTimer() {
      this.timer = 10;
      this.interval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.interval);
          this.resultMessage = 'Temps écoulé !';
          this.showResult = true;
          setTimeout(() => {
            this.nextQuestion();
          }, 2000);
        }
      }, 1000);
    },
    resetTimer() {
      clearInterval(this.interval);
      this.timer = 10;
    },
    restartQuiz() {
      this.currentQuestionIndex = 0;
      this.quizStore.resetScore();
      this.showResult = false;
      this.resultMessage = '';
      this.selectedAnswer = '';
      this.fetchQuestions();
    },
    startQuiz() {
      this.quizStarted = true;
      this.fetchQuestions();
    }
  },
  mounted() {
    this.quizStore.loadHighScores();
  }
});
</script>

<style scoped>
/* Vous pouvez ajouter du style CSS ici */
</style>
