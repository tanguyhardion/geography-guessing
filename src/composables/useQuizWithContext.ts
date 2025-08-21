/**
 * Example integration of quiz functionality into the Vue application
 * This file demonstrates how to use the quiz.ts module with the existing geography guessing game
 */

import { ref, computed, onMounted, readonly } from 'vue';
import { generateQuizQuestions, createMockQuizItem, validateContextNesting } from '../utils/quiz';
import type { QuizItem } from '../types';

/**
 * Composable for managing quiz questions with context extracts
 */
export function useQuizWithContext() {
  const quizItems = ref<QuizItem[]>([]);
  const currentQuizIndex = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const currentQuiz = computed(() => 
    quizItems.value[currentQuizIndex.value] || null
  );

  const hasNextQuiz = computed(() => 
    currentQuizIndex.value < quizItems.value.length - 1
  );

  const hasPreviousQuiz = computed(() => 
    currentQuizIndex.value > 0
  );

  /**
   * Generate quiz questions for a specific geography topic
   */
  async function generateQuizForTopic(topic: string, numQuestions: number = 5) {
    isLoading.value = true;
    error.value = null;

    try {
      const generated = await generateQuizQuestions({
        topic,
        numQuestions,
        difficulty: 'medium',
        language: 'French'
      });

      // Validate all generated quiz items
      const validQuizzes = generated.filter(quiz => {
        const isValid = validateContextNesting(quiz);
        if (!isValid) {
          console.warn('Invalid quiz item detected:', quiz.question);
        }
        return isValid;
      });

      quizItems.value = validQuizzes;
      currentQuizIndex.value = 0;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate quiz questions';
      console.error('Quiz generation failed:', err);
      
      // Fallback to mock data for demonstration
      console.log('Using mock data as fallback...');
      quizItems.value = [createMockQuizItem()];
      currentQuizIndex.value = 0;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load sample quiz data for demonstration
   */
  function loadSampleQuiz() {
    quizItems.value = [
      createMockQuizItem(),
      {
        question: "Quelle est la capitale de l'Italie ?",
        answer: "Rome",
        contextLarge: "L'Italie est un pays situé en Europe du Sud, dans la péninsule italienne. Ce pays a une histoire riche qui remonte à l'Empire romain, dont la capitale était Rome. L'Italie moderne a été unifiée au 19ème siècle et Rome a été choisie comme capitale du royaume d'Italie en 1871. Aujourd'hui, Rome reste la capitale de la République italienne et abrite le Vatican, un État souverain indépendant. La ville de Rome, surnommée la 'Ville éternelle', est située dans la région du Latium, au centre de l'Italie. Elle compte environ 2,8 millions d'habitants et est le centre politique, économique et culturel du pays. Rome abrite de nombreuses institutions gouvernementales italiennes, notamment le Palais du Quirinal, résidence du président de la République, le Palazzo Chigi, siège du gouvernement, et le Parlement italien.",
        contextMedium: "L'Italie est une république dont la capitale est Rome depuis l'unification du pays au 19ème siècle. Rome, située dans la région du Latium au centre de l'Italie, est le siège du gouvernement italien et abrite les principales institutions politiques du pays. Cette ville historique, berceau de l'Empire romain, continue de jouer un rôle central dans la politique et la culture italiennes. Avec ses monuments antiques comme le Colisée et le Forum romain, Rome attire des millions de visiteurs chaque année.",
        contextSmall: "Rome est la capitale de l'Italie depuis l'unification du pays en 1871. Située au centre de l'Italie dans la région du Latium, cette ville historique abrite le gouvernement italien et ses principales institutions politiques."
      }
    ];
    currentQuizIndex.value = 0;
  }

  /**
   * Navigate to the next quiz question
   */
  function nextQuiz() {
    if (hasNextQuiz.value) {
      currentQuizIndex.value++;
    }
  }

  /**
   * Navigate to the previous quiz question
   */
  function previousQuiz() {
    if (hasPreviousQuiz.value) {
      currentQuizIndex.value--;
    }
  }

  /**
   * Reset quiz state
   */
  function resetQuiz() {
    quizItems.value = [];
    currentQuizIndex.value = 0;
    error.value = null;
  }

  return {
    // State
    quizItems: readonly(quizItems),
    currentQuiz,
    currentQuizIndex: readonly(currentQuizIndex),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    hasNextQuiz,
    hasPreviousQuiz,

    // Actions
    generateQuizForTopic,
    loadSampleQuiz,
    nextQuiz,
    previousQuiz,
    resetQuiz
  };
}

/**
 * Integration example with existing game modes
 */
export function getQuizTopicsForGameMode(gameMode: string): string[] {
  switch (gameMode) {
    case 'guessChefLieu':
    case 'guessDepartmentName':
      return [
        'French departments and their chief towns',
        'French regional geography',
        'Administrative divisions of France'
      ];
    
    case 'guessWorldCapitals':
    case 'guessCountryFromCapital':
      return [
        'World capitals and countries',
        'European capitals',
        'Asian capitals',
        'African capitals',
        'American capitals'
      ];
    
    case 'guessFlags':
      return [
        'World flags and their meanings',
        'European flags',
        'National symbols and flags'
      ];
    
    case 'guessRussianCities':
      return [
        'Russian cities and geography',
        'Major cities of Russia',
        'Russian federal districts'
      ];
    
    case 'guessCountryMapLocation':
      return [
        'World geography and countries',
        'Continental geography',
        'Geographic features and countries'
      ];
    
    default:
      return ['General geography questions'];
  }
}