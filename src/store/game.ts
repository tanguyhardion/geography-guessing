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
/** Wrong guesses on a question before the hint button appears. */
export const HINT_THRESHOLD = 3;
/** Wrong guesses on a question before the answer is shown. */
export const REVEAL_THRESHOLD = 6;
/** Share of the other flags greyed out by a flag-grid hint. */
const FLAG_HINT_EXCLUDE_RATIO = 0.6;

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

/** A hint for the current question. Boards add their own visual part. */
export interface Hint {
  text: string;
  /** Answer with every letter but the first masked, for typed answers. */
  pattern?: string;
}

/** "Bosnie-Herzégovine" -> "B•••••-••••••••••": keeps spaces and punctuation. */
function maskAnswer(answer: string): string {
  return [...answer]
    .map((char, index) =>
      index === 0 || !/\p{L}|\p{N}/u.test(char) ? char : "•",
    )
    .join("");
}

function shuffled<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

  /** Hint taken for the current question, if any. */
  const hint = shallowRef<Hint | null>(null);
  /** Choices ruled out by the hint (grid boards grey them out). */
  const excluded = shallowRef<ReadonlySet<string>>(new Set());
  /** The answer to the current question is being shown. */
  const revealed = ref(false);

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
  const hintAvailable = computed(
    () =>
      !!current.value &&
      !locked.value &&
      !revealed.value &&
      !hint.value &&
      attempts.value >= HINT_THRESHOLD,
  );
  /** Wrong guesses left before the answer is shown. */
  const triesBeforeReveal = computed(() =>
    Math.max(REVEAL_THRESHOLD - attempts.value, 0),
  );
  /** Name of the current answer, as shown once it is revealed. */
  const answerLabel = computed(() => {
    const question = current.value;
    if (!question) return "";
    return question.answers?.[0] ?? choiceLabel(question.targetId) ?? "";
  });
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
    resetHelp();
    locked.value = false;
  }

  function resetHelp() {
    attempts.value = 0;
    hint.value = null;
    excluded.value = new Set();
    revealed.value = false;
  }

  function finish() {
    stopClock();
    resetHelp();
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
    resetHelp();

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
    if (excluded.value.has(id)) return; // ruled out by the hint
    if (revealed.value) {
      // Only the shown answer does something: it moves on.
      if (id === question.targetId) moveOn();
      return;
    }

    if (id === question.targetId) {
      acceptCorrect(question, "Correct !");
      return;
    }
    totalGuesses.value++;
    attempts.value++;
    setFlash({ id, kind: "wrong" });
    if (maybeReveal()) return;
    const label = choiceLabel(id);
    if (label) say("error", "Incorrect : tu as cliqué sur", label);
    else say("error", "Incorrect. Essaie encore ou passe.");
  }

  /** Guess by typing. Returns whether the answer was accepted. */
  function guessText(text: string): boolean {
    const question = current.value;
    if (!question || locked.value || !question.answers || !text.trim()) {
      return false;
    }
    const ownAnswers = new Set(question.answers.map(normalizeString));
    const others = new Set([...rivals].filter((r) => !ownAnswers.has(r)));
    const matches = isAnswerMatch(text, question.answers, others);

    if (revealed.value) {
      // Typing the shown answer is a way to move on; it does not score.
      if (matches) moveOn();
      return matches;
    }
    if (matches) {
      acceptCorrect(question, `Correct ! C'est bien ${question.answers[0]}.`);
      return true;
    }
    totalGuesses.value++;
    attempts.value++;
    if (maybeReveal()) return false;
    say(
      "error",
      attempts.value >= HINT_THRESHOLD && !hint.value
        ? "Incorrect. Besoin d'un indice ?"
        : "Incorrect. Essaie encore ou passe.",
    );
    return false;
  }

  /** Show the answer once there have been too many wrong guesses. */
  function maybeReveal(): boolean {
    if (attempts.value < REVEAL_THRESHOLD) return false;
    revealed.value = true;
    hint.value = null;
    excluded.value = new Set();
    const board = mode.value?.board;
    if (board === "text") {
      say("skip", "La réponse était :", answerLabel.value);
    } else if (board === "flags") {
      say("skip", "Trop d'essais : voici le bon drapeau.");
    } else {
      say("skip", "Trop d'essais. C'était :", answerLabel.value);
    }
    return true;
  }

  /** Give a hint for the current question (after a few wrong guesses). */
  function useHint() {
    const question = current.value;
    if (!question || !hintAvailable.value) return;
    const board = mode.value?.board;

    if (question.answers) {
      const answer = question.answers[0];
      const noun = question.answerNoun ?? "La réponse";
      hint.value = {
        text: `${noun} commence par « ${answer.charAt(0)} ».`,
        pattern: maskAnswer(answer),
      };
    } else if (board === "numbers") {
      const prefix = question.targetId.charAt(0);
      excluded.value = new Set(
        choices.value
          .filter(
            (c) => c.id.charAt(0) !== prefix && status.value[c.id] !== "done",
          )
          .map((c) => c.id),
      );
      hint.value = { text: `Le numéro commence par « ${prefix} ».` };
    } else if (board === "flags") {
      const others = choices.value.filter(
        (c) =>
          c.id !== question.targetId &&
          c.group === question.group &&
          status.value[c.id] !== "done",
      );
      const count = Math.floor(others.length * FLAG_HINT_EXCLUDE_RATIO);
      excluded.value = new Set(
        shuffled(others)
          .slice(0, count)
          .map((c) => c.id),
      );
      hint.value = {
        text:
          count > 1
            ? `${count} mauvais drapeaux ont été écartés.`
            : "Un mauvais drapeau a été écarté.",
      };
    } else {
      // The map draws the zone itself.
      hint.value = { text: "Cherche dans la zone entourée sur la carte." };
    }
    say("hint", "Indice :", hint.value.text);
  }

  /** Leave a revealed question. It stays in the pool and comes back later. */
  function moveOn() {
    if (!current.value) return;
    setFlash(null);
    pickNext();
  }

  /** Skip the current question. It stays in the pool and comes back later. */
  function skip() {
    const question = current.value;
    if (!question || locked.value) return;
    if (revealed.value) {
      moveOn();
      return;
    }
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
    hint,
    excluded,
    revealed,
    hintAvailable,
    triesBeforeReveal,
    answerLabel,
    useHint,
    start,
    restart,
    stop,
    guessChoice,
    guessText,
    skip,
    setAltLanguage,
  };
});
