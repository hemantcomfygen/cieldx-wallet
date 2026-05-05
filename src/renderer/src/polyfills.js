import { Buffer } from 'buffer';
import process from 'process';

// Apply polyfills immediately
window.Buffer = window.Buffer || Buffer;
window.process = window.process || process;
window.global = window.global || window;

// Also set on globalThis for ES modules
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = globalThis.Buffer || Buffer;
  globalThis.process = globalThis.process || process;
  globalThis.global = globalThis.global || globalThis;
}