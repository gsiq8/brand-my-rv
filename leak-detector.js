import { EventEmitter } from 'events';

const originalAddListener = EventEmitter.prototype.addListener;
EventEmitter.prototype.addListener = function(eventName, listener) {
  if (eventName === 'close' && this.listenerCount('close') >= 10) {
    console.warn(`\n⚠️ Potential 'close' listener leak detected on:`, this.constructor.name);
    console.trace();
  }
  return originalAddListener.call(this, eventName, listener);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;