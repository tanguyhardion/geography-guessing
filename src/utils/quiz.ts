import type { QuizItem } from '../types';

/**
 * Configuration for LLM API calls
 */
interface LLMConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

/**
 * Request payload for generating quiz questions with context
 */
interface QuizGenerationRequest {
  topic: string;
  numQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
}

/**
 * Generate a prompt for the LLM to create quiz questions with nested context extracts
 */
function generateQuizPrompt(request: QuizGenerationRequest): string {
  const { topic, numQuestions, difficulty = 'medium', language = 'French' } = request;
  
  return `Generate ${numQuestions} quiz question(s) about ${topic} in ${language}. 
For each question, provide:
1. A clear question
2. A precise answer
3. Three nested context extracts that all contain the answer:
   - contextLarge: A comprehensive, multi-paragraph text (3-4 paragraphs) that provides detailed background information and contains the answer
   - contextMedium: A shorter text (1-2 paragraphs) that still provides context and contains the answer
   - contextSmall: A concise, single paragraph that directly relates to the question and contains the answer

The context extracts should be nested: contextSmall should be contained within contextMedium, and contextMedium should be contained within contextLarge.

Difficulty level: ${difficulty}

Format your response as a JSON array of objects with the following structure:
[
  {
    "question": "Your question here",
    "answer": "The precise answer",
    "contextLarge": "Multi-paragraph detailed context containing the answer...",
    "contextMedium": "Shorter context containing the answer...",
    "contextSmall": "Concise single paragraph containing the answer..."
  }
]

Ensure all context extracts are factually accurate and educational.`;
}

/**
 * Make an API call to the LLM to generate quiz questions
 */
async function callLLMAPI(prompt: string, config: LLMConfig): Promise<string> {
  const {
    apiKey = process.env.VITE_LLM_API_KEY,
    endpoint = process.env.VITE_LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    model = process.env.VITE_LLM_MODEL || 'gpt-3.5-turbo'
  } = config;

  if (!apiKey) {
    throw new Error('LLM API key is required. Please set VITE_LLM_API_KEY environment variable.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator specialized in geography. Generate high-quality quiz questions with nested context extracts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`LLM API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Parse the LLM response and validate the quiz items
 */
function parseQuizResponse(response: string): QuizItem[] {
  try {
    // Clean up the response in case there's extra text
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }

    const quizItems: QuizItem[] = JSON.parse(jsonMatch[0]);
    
    // Validate each quiz item
    return quizItems.map((item, index) => {
      if (!item.question || !item.answer || !item.contextLarge || !item.contextMedium || !item.contextSmall) {
        throw new Error(`Quiz item ${index + 1} is missing required fields`);
      }

      // Validate that contexts are nested (approximate check)
      if (item.contextSmall.length >= item.contextMedium.length || 
          item.contextMedium.length >= item.contextLarge.length) {
        console.warn(`Quiz item ${index + 1} contexts may not be properly nested by size`);
      }

      return {
        question: item.question.trim(),
        answer: item.answer.trim(),
        contextLarge: item.contextLarge.trim(),
        contextMedium: item.contextMedium.trim(),
        contextSmall: item.contextSmall.trim()
      };
    });
  } catch (error) {
    throw new Error(`Failed to parse quiz response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate quiz questions with nested context extracts using LLM
 */
export async function generateQuizQuestions(
  request: QuizGenerationRequest,
  config: LLMConfig = {}
): Promise<QuizItem[]> {
  try {
    // Generate the prompt for the LLM
    const prompt = generateQuizPrompt(request);
    
    // Call the LLM API
    const response = await callLLMAPI(prompt, config);
    
    // Parse and validate the response
    const quizItems = parseQuizResponse(response);
    
    return quizItems;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

/**
 * Create a mock quiz item for testing purposes
 */
export function createMockQuizItem(): QuizItem {
  return {
    question: "Quelle est la capitale de la France ?",
    answer: "Paris",
    contextLarge: "La France est un pays situé en Europe occidentale, bordé par plusieurs pays et océans. Son territoire métropolitain s'étend de la mer du Nord et de la Manche au nord jusqu'à la mer Méditerranée au sud, et de l'océan Atlantique à l'ouest jusqu'aux Alpes et au Rhin à l'est. La France possède une riche histoire politique et culturelle qui s'étend sur plusieurs millénaires. Sa capitale, Paris, est située dans la région Île-de-France, au centre-nord du pays, sur les rives de la Seine. Paris est non seulement le centre politique et administratif de la France, mais aussi son principal centre économique et culturel. La ville abrite de nombreuses institutions gouvernementales, notamment l'Élysée, le Palais du Luxembourg, et l'Assemblée nationale. Avec ses nombreux monuments historiques comme la Tour Eiffel, le Louvre, et Notre-Dame, Paris attire des millions de visiteurs chaque année.",
    contextMedium: "La France est une république dont le système politique est centralisé autour de sa capitale. Paris, située au cœur de la région Île-de-France, sert de centre névralgique pour toutes les décisions politiques, économiques et culturelles du pays. Cette métropole de plus de 2 millions d'habitants dans la ville proprement dite, et plus de 12 millions dans son aire urbaine, concentre les institutions gouvernementales majeures et les sièges des grandes entreprises françaises. La ville est également un centre culturel mondial, abritant des musées prestigieux et des monuments emblématiques qui font de Paris l'une des destinations touristiques les plus visitées au monde.",
    contextSmall: "Paris est la capitale et la plus grande ville de France. Située au centre-nord du pays sur la Seine, cette métropole abrite les principales institutions politiques françaises including le palais présidentiel de l'Élysée, l'Assemblée nationale, et le Sénat. Avec son riche patrimoine architectural et culturel, Paris est également connue mondialement pour ses monuments comme la Tour Eiffel et le musée du Louvre."
  };
}

/**
 * Validate that context extracts are properly nested
 */
export function validateContextNesting(item: QuizItem): boolean {
  // Check that all contexts contain the answer
  const answer = item.answer.toLowerCase();
  const containsAnswer = (text: string) => text.toLowerCase().includes(answer);
  
  if (!containsAnswer(item.contextLarge) || 
      !containsAnswer(item.contextMedium) || 
      !containsAnswer(item.contextSmall)) {
    return false;
  }

  // Check that contexts are reasonably nested by content
  // (This is a simplified check - in practice, semantic analysis would be better)
  return item.contextSmall.length < item.contextMedium.length && 
         item.contextMedium.length < item.contextLarge.length;
}