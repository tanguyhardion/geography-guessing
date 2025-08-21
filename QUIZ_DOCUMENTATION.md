# Quiz System with Nested Context Extracts

This implementation adds a new quiz system to the geography-guessing application that generates questions with three levels of nested context extracts using LLM integration.

## Features Implemented

### 1. TypeScript Interface for Quiz Items

Added a new `QuizItem` interface in `src/types/index.ts`:

```typescript
export interface QuizItem {
  question: string;
  answer: string;
  contextLarge: string;  // Large, multi-paragraph, contains the answer
  contextMedium: string; // Smaller, but still contains the answer
  contextSmall: string;  // One paragraph, concise, contains the answer
}
```

### 2. LLM Integration Module

Created `src/utils/quiz.ts` with the following functionality:

- **Prompt Generation**: Creates optimized prompts for LLM to generate quiz questions with nested context extracts
- **API Integration**: Handles API calls to LLM services (OpenAI-compatible)
- **Response Parsing**: Parses and validates LLM responses
- **Context Validation**: Ensures all context levels contain the answer and are properly nested

### 3. Vue Composable for Quiz Management

Created `src/composables/useQuizWithContext.ts` providing:

- Reactive state management for quiz items
- Navigation between questions
- Error handling and loading states
- Integration with existing game modes
- Sample data generation

### 4. Demo Components

- **QuizDemo.vue**: Interactive component demonstrating the quiz functionality
- **QuizDemoPage.vue**: Full page demo with implementation details
- Added route `/quiz-demo` to showcase the feature

## API Configuration

To use the LLM integration, configure these environment variables:

```bash
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions  # Optional
VITE_LLM_MODEL=gpt-3.5-turbo  # Optional
```

## Usage Examples

### Basic Usage

```typescript
import { generateQuizQuestions, createMockQuizItem } from './utils/quiz';

// Generate quiz with LLM (requires API key)
const quizItems = await generateQuizQuestions({
  topic: "French geography and capitals",
  numQuestions: 3,
  difficulty: "medium",
  language: "French"
});

// Use mock data for testing
const mockQuiz = createMockQuizItem();
```

### Vue Component Integration

```vue
<script setup>
import { useQuizWithContext } from '../composables/useQuizWithContext';

const {
  currentQuiz,
  generateQuizForTopic,
  loadSampleQuiz
} = useQuizWithContext();

// Load sample data
loadSampleQuiz();

// Generate new quiz (requires API)
await generateQuizForTopic('World capitals', 5);
</script>
```

## Context Extract Nesting

The system ensures that context extracts are properly nested:

1. **contextLarge**: Comprehensive, multi-paragraph text (typically 3-4 paragraphs)
2. **contextMedium**: Shorter text (1-2 paragraphs) contained within contextLarge
3. **contextSmall**: Concise single paragraph contained within contextMedium

All three context levels contain the answer to the question.

## Validation

The implementation includes validation to ensure:

- All required fields are present
- Context sizes follow the expected nesting pattern
- All contexts contain the correct answer
- JSON responses from LLM are properly formatted

## Testing

Run the test suite:

```bash
npx tsx src/test/quiz.test.ts
```

The tests validate:
- Mock quiz item creation
- Context nesting validation
- Quiz item structure
- Answer presence in all contexts

## Integration with Existing Game Modes

The quiz system can be integrated with existing game modes by mapping topics:

- French departments → "French departments and their chief towns"
- World capitals → "World capitals and countries"
- Flags → "World flags and their meanings"
- Russian cities → "Russian cities and geography"

## Error Handling

The system gracefully handles:
- Missing API keys (falls back to mock data)
- API request failures
- Invalid LLM responses
- Network connectivity issues

## Files Added/Modified

### New Files:
- `src/types/index.ts` - Added QuizItem interface
- `src/utils/quiz.ts` - Core quiz functionality
- `src/composables/useQuizWithContext.ts` - Vue composable
- `src/components/QuizDemo.vue` - Demo component
- `src/pages/QuizDemoPage.vue` - Demo page
- `src/test/quiz.test.ts` - Test suite
- `QUIZ_DOCUMENTATION.md` - This documentation

### Modified Files:
- `src/router/index.ts` - Added quiz demo route

## Next Steps

1. Configure LLM API credentials for live quiz generation
2. Integrate quiz system with existing game modes
3. Add more sophisticated context validation
4. Implement user feedback collection
5. Add support for multiple languages
6. Create quiz templates for different subjects

## Demo

Visit `/quiz-demo` to see the interactive demonstration of the quiz system.