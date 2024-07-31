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
        this.events[event].forEach(listener => listener(data));
      }
    },
  
    off(event, listener) {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter(l => l !== listener);
      }
    }
  };
  
  export default eventBus;
  