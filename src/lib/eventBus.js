/**
 * NOTE: This is a simple event bus which is a mechanism for managing events and their corresponding listeners.
 * It is essentially a centralized system for handling events in the application as it allows different part of
 * the application to communicate in a decoupled way.
 *
 * Generally, in this application its used for site-wide features like displaying notifications (snackbars, alerts)
 * including generator alerts such as truncations, no timetables, etc where different components need to trigger
 * and respons to events without direct dependencies.
 */

const eventBus = {
  events: {},

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(data));
    }
  },

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    }
  },
};

export default eventBus;
