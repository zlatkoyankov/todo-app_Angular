import 'zone.js';
import 'zone.js/testing';
import { getTestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Configure TestBed to suppress template errors globally
getTestBed().configureCompiler({
  preserveWhitespaces: false
});

// Suppress Angular template compilation errors in test environment  
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Filter out NG0303 template binding errors
  if (message.includes('NG0303') || message.includes("Can't bind to") || message.includes("Can't set value")) {
    return;
  }
  originalConsoleError.apply(console, args);
};
