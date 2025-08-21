<template>
  <div class="demo-page">
    <div class="page-header">
      <h1>Démonstration du Système de Quiz avec Contextes</h1>
      <p class="subtitle">
        Cette page démontre la nouvelle fonctionnalité de génération de quiz avec extraits de contexte imbriqués.
      </p>
    </div>

    <div class="demo-info">
      <h2>Fonctionnalités Implémentées</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>📝 Interface QuizItem</h3>
          <p>Nouvelle interface TypeScript avec question, answer, contextLarge, contextMedium, et contextSmall.</p>
        </div>
        
        <div class="feature-card">
          <h3>🤖 Intégration LLM</h3>
          <p>API pour générer des quiz avec prompts optimisés pour créer des contextes imbriqués.</p>
        </div>
        
        <div class="feature-card">
          <h3>🔗 Contextes Imbriqués</h3>
          <p>Trois niveaux de contexte où chaque niveau plus petit est contenu dans le plus grand.</p>
        </div>
        
        <div class="feature-card">
          <h3>✅ Validation</h3>
          <p>Validation automatique que tous les contextes contiennent la réponse.</p>
        </div>
      </div>
    </div>

    <QuizDemo />

    <div class="implementation-details">
      <h2>Détails Techniques</h2>
      
      <div class="code-section">
        <h3>Interface QuizItem</h3>
        <pre><code>export interface QuizItem {
  question: string;
  answer: string;
  contextLarge: string;  // Large, multi-paragraph, contains the answer
  contextMedium: string; // Smaller, but still contains the answer
  contextSmall: string;  // One paragraph, concise, contains the answer
}</code></pre>
      </div>

      <div class="code-section">
        <h3>Génération de Quiz</h3>
        <pre><code>// Utilisation avec clé API
const quizItems = await generateQuizQuestions({
  topic: "French geography and capitals",
  numQuestions: 3,
  difficulty: "medium",
  language: "French"
});

// Exemple de données simulées
const mockQuiz = createMockQuizItem();</code></pre>
      </div>

      <div class="api-config">
        <h3>Configuration API</h3>
        <p>Pour utiliser la génération automatique, configurez les variables d'environnement :</p>
        <ul>
          <li><code>VITE_LLM_API_KEY</code> - Clé API pour le service LLM</li>
          <li><code>VITE_LLM_ENDPOINT</code> - Point de terminaison API (optionnel)</li>
          <li><code>VITE_LLM_MODEL</code> - Modèle à utiliser (optionnel)</li>
        </ul>
      </div>
    </div>

    <div class="navigation-back">
      <router-link to="/" class="btn btn-home">
        ← Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuizDemo from '../components/QuizDemo.vue';
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1em;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.demo-info {
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.feature-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.feature-card p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.implementation-details {
  margin: 40px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.code-section {
  margin: 20px 0;
}

.code-section h3 {
  color: #333;
  margin-bottom: 10px;
}

.code-section pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.5;
}

.api-config {
  margin: 20px 0;
  padding: 15px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.api-config h3 {
  margin-top: 0;
  color: #856404;
}

.api-config ul {
  margin-bottom: 0;
}

.api-config li {
  margin: 5px 0;
}

.api-config code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.navigation-back {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-home {
  background-color: #6c757d;
  color: white;
}

.btn-home:hover {
  background-color: #545b62;
  text-decoration: none;
}

@media (max-width: 768px) {
  .demo-page {
    padding: 15px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .code-section pre {
    font-size: 0.8em;
  }
}
</style>