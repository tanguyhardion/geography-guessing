<template>
  <div class="quiz-demo">
    <h2>Quiz avec Contextes - Démonstration</h2>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      <p>Génération des questions de quiz...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error">
      <p>Erreur: {{ error }}</p>
      <button @click="loadSampleQuiz" class="btn btn-secondary">
        Utiliser des données d'exemple
      </button>
    </div>

    <!-- Quiz controls -->
    <div v-if="!isLoading && !error" class="quiz-controls">
      <button @click="loadSampleQuiz" class="btn btn-primary">
        Charger un Quiz d'Exemple
      </button>
      
      <button @click="generateQuiz" class="btn btn-secondary" :disabled="isLoading">
        Générer un Quiz (Nécessite une clé API)
      </button>
    </div>

    <!-- Quiz display -->
    <div v-if="currentQuiz && !isLoading" class="quiz-content">
      <div class="quiz-header">
        <h3>Question {{ currentQuizIndex + 1 }} / {{ quizItems.length }}</h3>
        <div class="quiz-navigation">
          <button 
            @click="previousQuiz" 
            :disabled="!hasPreviousQuiz"
            class="btn btn-nav"
          >
            ← Précédent
          </button>
          <button 
            @click="nextQuiz" 
            :disabled="!hasNextQuiz"
            class="btn btn-nav"
          >
            Suivant →
          </button>
        </div>
      </div>

      <div class="quiz-question">
        <h4>{{ currentQuiz.question }}</h4>
        
        <!-- Answer reveal button -->
        <button 
          @click="toggleAnswerVisibility" 
          class="btn btn-reveal"
        >
          {{ showAnswer ? 'Masquer' : 'Révéler' }} la réponse
        </button>
        
        <div v-if="showAnswer" class="answer">
          <strong>Réponse: {{ currentQuiz.answer }}</strong>
        </div>
      </div>

      <!-- Context levels -->
      <div class="context-sections">
        <div class="context-controls">
          <button 
            v-for="level in contextLevels" 
            :key="level.key"
            @click="showContext = level.key"
            :class="['btn', 'btn-context', { 'active': showContext === level.key }]"
          >
            {{ level.label }}
          </button>
        </div>

        <div class="context-display">
          <div v-if="showContext === 'small'" class="context context-small">
            <h5>Contexte Concis</h5>
            <p>{{ currentQuiz.contextSmall }}</p>
            <small>Taille: {{ currentQuiz.contextSmall.length }} caractères</small>
          </div>

          <div v-if="showContext === 'medium'" class="context context-medium">
            <h5>Contexte Moyen</h5>
            <p>{{ currentQuiz.contextMedium }}</p>
            <small>Taille: {{ currentQuiz.contextMedium.length }} caractères</small>
          </div>

          <div v-if="showContext === 'large'" class="context context-large">
            <h5>Contexte Détaillé</h5>
            <p>{{ currentQuiz.contextLarge }}</p>
            <small>Taille: {{ currentQuiz.contextLarge.length }} caractères</small>
          </div>
        </div>
      </div>

      <!-- Context comparison -->
      <div class="context-info">
        <h5>Informations sur les Contextes</h5>
        <ul>
          <li>Contexte concis: {{ currentQuiz.contextSmall.length }} caractères</li>
          <li>Contexte moyen: {{ currentQuiz.contextMedium.length }} caractères</li>
          <li>Contexte détaillé: {{ currentQuiz.contextLarge.length }} caractères</li>
        </ul>
        <p>
          <small>
            Les contextes sont imbriqués et contiennent tous la réponse "{{ currentQuiz.answer }}".
          </small>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useQuizWithContext } from '../composables/useQuizWithContext';

const {
  quizItems,
  currentQuiz,
  currentQuizIndex,
  isLoading,
  error,
  hasNextQuiz,
  hasPreviousQuiz,
  generateQuizForTopic,
  loadSampleQuiz,
  nextQuiz,
  previousQuiz
} = useQuizWithContext();

const showAnswer = ref(false);
const showContext = ref<'small' | 'medium' | 'large'>('small');

const contextLevels = [
  { key: 'small' as const, label: 'Concis' },
  { key: 'medium' as const, label: 'Moyen' },
  { key: 'large' as const, label: 'Détaillé' }
];

function toggleAnswerVisibility() {
  showAnswer.value = !showAnswer.value;
}

async function generateQuiz() {
  showAnswer.value = false;
  showContext.value = 'small';
  await generateQuizForTopic('Geography of France and its capitals', 3);
}

// Reset answer visibility when quiz changes
watchEffect(() => {
  if (currentQuiz.value) {
    showAnswer.value = false;
    showContext.value = 'small';
  }
});
</script>

<style scoped>
.quiz-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}

.quiz-controls {
  text-align: center;
  margin: 20px 0;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-nav:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.btn-context {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
}

.btn-context.active {
  background-color: #007bff;
  color: white;
}

.btn-reveal {
  background-color: #28a745;
  color: white;
  margin: 10px 0;
}

.btn-reveal:hover {
  background-color: #218838;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.quiz-navigation {
  display: flex;
  gap: 10px;
}

.quiz-question {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.answer {
  margin-top: 10px;
  padding: 10px;
  background-color: #d4edda;
  border-left: 4px solid #28a745;
  border-radius: 4px;
}

.context-sections {
  margin: 20px 0;
}

.context-controls {
  margin-bottom: 10px;
  text-align: center;
}

.context-display {
  min-height: 150px;
}

.context {
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
}

.context-small {
  background-color: #e7f3ff;
  border-left: 4px solid #007bff;
}

.context-medium {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.context-large {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
}

.context h5 {
  margin-top: 0;
  margin-bottom: 10px;
}

.context small {
  color: #6c757d;
  font-style: italic;
}

.context-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f1f3f4;
  border-radius: 4px;
}

.context-info h5 {
  margin-top: 0;
}

.context-info ul {
  margin-bottom: 10px;
}
</style>