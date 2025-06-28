// Simple event bus for decoupled component communication
// Use this for cross-component events (e.g., navigation, global actions)
// Type safety ensures only valid events are emitted/listened for
import mitt, { type Emitter } from "mitt";

// Define all allowed event names and their payload types here
export type AppEvents = {
  "navigate-stats": void;
  "navigate-home": void;
  // Add more events as needed, e.g.:
  // 'user-logged-in': { userId: string };
};

const emitter: Emitter<AppEvents> = mitt<AppEvents>();
export default emitter;
