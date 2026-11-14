// The single game engine shared by every mode. A mode supplies questions and
// choices (see game/modes.ts); this store runs the round: picking questions,
// judging guesses, timing, feedback and the final result.
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import type { Choice, ModeDef, Question } from "../game/modes";
import type { ContinentFilter } from "../types";
import {
  formatClock,
  isAnswerMatch,
  normalizeString,
} from "../utils/stringUtils";
import { logGameCompletion } from "../utils/completionLogger";

/** Pause on a correct answer before the next question appears. */
const NEXT_QUESTION_DELAY = 800;
/** How long a wrong click / revealed answer stays highlighted on the board. */
const FLASH_DURATION = 1400;
/** Wrong typed answers before the first letter is given away. */
const HINT_THRESHOLD = 3;

export type FeedbackKind = "success" | "error" | "hint" | "skip";
export interface Feedback {
  seq: number;
  kind: FeedbackKind;
  text: string;
  /** Emphasised trailing part, e.g. the revealed answer. */
  strong?: string;
}
export interface Flash {
  id: string;
  kind: "wrong" | "reveal";
}
export type ChoiceStatus = "partial" | "done";

export const useGameStore = defineStore("game", () => {
  const mode = shallowRef<ModeDef | null>(null);
  const continent = ref<ContinentFilter>("all");
  const choices = shallowRef<Choice[]>([]);
  const remaining = shallowRef<Question[]>([]);
  const total = ref(0);
  const current = shallowRef<Question | null>(null);
  const status = ref<Record<string, ChoiceStatus>>({});
  const useAlt = ref(false);

  const totalGuesses = ref(0);
  const correctGuesses = ref(0);
  const attempts = ref(0);
  const locked = ref(false);
  const complete = ref(false);
  const elapsed = ref(0);

  const feedback = ref<Feedback | null>(null);
  const flash = ref<Flash | null>(null);

  // Non-reactive bookkeeping.
  let choiceById = new Map<string, Choice>();
  let rivals = new Set<string>();
  let restrictTo: ReadonlySet<string> | undefined;
  let startedAt = 0;
  let feedbackSeq = 0;
  let tickTimer: number | undefined;
  let nextTimer: number | undefined;
  let flashTimer: number | undefined;

  const answered = computed(() => total.value - remaining.value.length);
  const accuracy = computed(() =>
    totalGuesses.value === 0
      ? 100
      : Math.round((correctGuesses.value / totalGuesses.value) * 100),
  );
  const mistakes = computed(() => totalGuesses.value - correctGuesses.value);
  const clock = computed(() => formatClock(elapsed.value));
  const promptText = computed(() => {
    const question = current.value;
    if (!question) return "";
    return useAlt.value && question.promptAlt
      ? question.promptAlt
      : question.prompt;
  });

  function choiceLabel(id: string): string | undefined {
    const choice = choiceById.get(id);
    if (!choice) return undefined;
    return useAlt.value && choice.labelAlt ? choice.labelAlt : choice.label;
  }

  function say(kind: FeedbackKind, text: string, strong?: string) {
    feedback.value = { seq: ++feedbackSeq, kind, text, strong };
  }

  function setFlash(next: Flash | null) {
    window.clearTimeout(flashTimer);
    flash.value = next;
    if (next) {
      flashTimer = window.setTimeout(() => {
        flash.value = null;
      }, FLASH_DURATION);
    }
  }

  function stopClock() {
    window.clearInterval(tickTimer);
    tickTimer = undefined;
  }

  function startClock() {
    stopClock();
    startedAt = Date.now();
    elapsed.value = 0;
    tickTimer = window.setInterval(() => {
      elapsed.value = Math.floor((Date.now() - startedAt) / 1000);
    }, 500);
  }

  /** Stop every pending timer. Call when leaving the game page. */
  function stop() {
    stopClock();
    window.clearTimeout(nextTimer);
    window.clearTimeout(flashTimer);
    feedback.value = null;
    flash.value = null;
  }

  function pickNext() {
    const pool = remaining.value;
    if (pool.length === 0) {
      finish();
      return;
    }
    // Never ask the same question twice in a row (matters after a skip).
    const previousKey = current.value?.key;
    const candidates =
      pool.length > 1 ? pool.filter((q) => q.key !== previousKey) : pool;
    current.value = candidates[Math.floor(Math.random() * candidates.length)];
    attempts.value = 0;
    locked.value = false;
  }

  function finish() {
    stopClock();
    elapsed.value = Math.floor((Date.now() - startedAt) / 1000);
    current.value = null;
    locked.value = false;
    complete.value = true;
    if (mode.value) {
      logGameCompletion({
        modeId: mode.value.id,
        modeName: mode.value.logName,
        continent: continent.value,
        completedAt: new Date().toISOString(),
        totalTime: elapsed.value,
        finalScore: correctGuesses.value,
        accuracy: accuracy.value,
      });
    }
  }

  /**
   * Start (or restart) a round.
   * @param availableIds when given, only questions whose target is in this set
   *   are asked, e.g. the regions actually present in the loaded map data.
   */
  function start(
    nextMode: ModeDef,
    nextContinent: ContinentFilter,
    availableIds?: ReadonlySet<string>,
  ) {
    stop();
    const modeChanged = mode.value?.id !== nextMode.id;
    mode.value = nextMode;
    continent.value = nextContinent;
    restrictTo = availableIds;
    if (modeChanged) useAlt.value = nextMode.altLang?.defaultAlt ?? false;

    const built = nextMode.build(nextContinent);
    const keep = (id: string) => !availableIds || availableIds.has(id);
    const questions = built.questions.filter((q) => keep(q.targetId));

    choices.value = built.choices.filter((c) => keep(c.id));
    choiceById = new Map(choices.value.map((c) => [c.id, c]));
    rivals = new Set(
      questions.flatMap((q) => (q.answers ?? []).map(normalizeString)),
    );
    remaining.value = questions;
    total.value = questions.length;
    status.value = {};
    totalGuesses.value = 0;
    correctGuesses.value = 0;
    complete.value = false;
    current.value = null;

    if (questions.length === 0) return;
    pickNext();
    startClock();
  }

  function restart() {
    if (mode.value) start(mode.value, continent.value, restrictTo);
  }

  function acceptCorrect(question: Question, message: string) {
    totalGuesses.value++;
    correctGuesses.value++;
    remaining.value = remaining.value.filter((q) => q.key !== question.key);
    status.value[question.targetId] = remaining.value.some(
      (q) => q.targetId === question.targetId,
    )
      ? "partial"
      : "done";
    say("success", message);
    setFlash(null);
    // Lock the board so a second click during the pause is not counted again.
    locked.value = true;
    nextTimer = window.setTimeout(pickNext, NEXT_QUESTION_DELAY);
  }

  /** Guess by clicking a choice (map region, marker, flag, number). */
  function guessChoice(id: string) {
    const question = current.value;
    if (!question || locked.value) return;
    if (status.value[id] === "done") return; // already found: not a guess

    if (id === question.targetId) {
      acceptCorrect(question, "Correct !");
      return;
    }
    totalGuesses.value++;
    attempts.value++;
    const label = choiceLabel(id);
    if (label) say("error", "Incorrect : tu as cliqué sur", label);
    else say("error", "Incorrect. Essaie encore ou passe.");
    setFlash({ id, kind: "wrong" });
  }

  /** Guess by typing. Returns whether the answer was accepted. */
  function guessText(text: string): boolean {
    const question = current.value;
    if (!question || locked.value || !question.answers || !text.trim()) {
      return false;
    }
    const ownAnswers = new Set(question.answers.map(normalizeString));
    const others = new Set([...rivals].filter((r) => !ownAnswers.has(r)));

    if (isAnswerMatch(text, question.answers, others)) {
      acceptCorrect(question, `Correct ! C'est bien ${question.answers[0]}.`);
      return true;
    }
    totalGuesses.value++;
    attempts.value++;
    if (attempts.value >= HINT_THRESHOLD) {
      const noun = question.answerNoun ?? "La réponse";
      say(
        "hint",
        `Indice : ${noun.toLowerCase()} commence par`,
        question.answers[0].charAt(0),
      );
    } else {
      say("error", "Incorrect. Essaie encore ou passe.");
    }
    return false;
  }

  /** Skip the current question. It stays in the pool and comes back later. */
  function skip() {
    const question = current.value;
    if (!question || locked.value) return;
    if (question.answers) {
      say("skip", "Passé. C'était :", question.answers[0]);
    } else {
      // Click boards show where the answer was instead of naming it.
      say("skip", "Passé.");
      setFlash({ id: question.targetId, kind: "reveal" });
    }
    pickNext();
  }

  function setAltLanguage(value: boolean) {
    useAlt.value = value;
  }

  return {
    mode,
    continent,
    choices,
    total,
    current,
    status,
    useAlt,
    totalGuesses,
    correctGuesses,
    attempts,
    locked,
    complete,
    elapsed,
    feedback,
    flash,
    answered,
    accuracy,
    mistakes,
    clock,
    promptText,
    start,
    restart,
    stop,
    guessChoice,
    guessText,
    skip,
    setAltLanguage,
  };
});
