import { createMockQuizItem, validateContextNesting } from '../utils/quiz';
import type { QuizItem } from '../types';

/**
 * Simple test runner for quiz functionality
 */
function runTests() {
  console.log('Running quiz.ts tests...\n');

  // Test 1: Mock quiz item creation
  console.log('Test 1: Creating mock quiz item');
  try {
    const mockItem = createMockQuizItem();
    console.log('✓ Mock quiz item created successfully');
    console.log(`  Question: ${mockItem.question}`);
    console.log(`  Answer: ${mockItem.answer}`);
    console.log(`  Context sizes: Large(${mockItem.contextLarge.length}), Medium(${mockItem.contextMedium.length}), Small(${mockItem.contextSmall.length})`);
  } catch (error) {
    console.error('✗ Failed to create mock quiz item:', error);
  }

  // Test 2: Context nesting validation
  console.log('\nTest 2: Validating context nesting');
  try {
    const mockItem = createMockQuizItem();
    const isValid = validateContextNesting(mockItem);
    if (isValid) {
      console.log('✓ Context nesting validation passed');
    } else {
      console.log('✗ Context nesting validation failed');
    }
  } catch (error) {
    console.error('✗ Error during context validation:', error);
  }

  // Test 3: Quiz item structure validation
  console.log('\nTest 3: Validating quiz item structure');
  try {
    const mockItem = createMockQuizItem();
    const requiredFields = ['question', 'answer', 'contextLarge', 'contextMedium', 'contextSmall'];
    const hasAllFields = requiredFields.every(field => {
      const value = (mockItem as any)[field];
      return value && typeof value === 'string' && value.trim().length > 0;
    });

    if (hasAllFields) {
      console.log('✓ Quiz item has all required fields');
    } else {
      console.log('✗ Quiz item missing required fields');
    }
  } catch (error) {
    console.error('✗ Error during structure validation:', error);
  }

  // Test 4: Answer presence in contexts
  console.log('\nTest 4: Verifying answer presence in all contexts');
  try {
    const mockItem = createMockQuizItem();
    const answer = mockItem.answer.toLowerCase();
    const inLarge = mockItem.contextLarge.toLowerCase().includes(answer);
    const inMedium = mockItem.contextMedium.toLowerCase().includes(answer);
    const inSmall = mockItem.contextSmall.toLowerCase().includes(answer);

    console.log(`  Answer "${answer}" in contextLarge: ${inLarge ? '✓' : '✗'}`);
    console.log(`  Answer "${answer}" in contextMedium: ${inMedium ? '✓' : '✗'}`);
    console.log(`  Answer "${answer}" in contextSmall: ${inSmall ? '✓' : '✗'}`);

    if (inLarge && inMedium && inSmall) {
      console.log('✓ Answer found in all context extracts');
    } else {
      console.log('✗ Answer not found in all context extracts');
    }
  } catch (error) {
    console.error('✗ Error during answer presence test:', error);
  }

  console.log('\nTests completed!');
}

// Example of how to use the quiz generation (commented out since it requires API keys)
function exampleUsage() {
  console.log('\nExample usage (requires API configuration):');
  console.log(`
import { generateQuizQuestions } from './utils/quiz';

// Example API call (requires VITE_LLM_API_KEY environment variable)
async function generateGeographyQuiz() {
  try {
    const quizItems = await generateQuizQuestions({
      topic: "French geography and capitals",
      numQuestions: 3,
      difficulty: "medium",
      language: "French"
    });
    
    console.log('Generated quiz items:', quizItems);
  } catch (error) {
    console.error('Failed to generate quiz:', error);
  }
}
  `);
}

// Run tests when this module is executed
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('load', () => {
    runTests();
    exampleUsage();
  });
} else {
  // Node.js environment
  runTests();
  exampleUsage();
}

export { runTests, exampleUsage };