// This file is required by karma.conf.js and loads recursively all the .spec.ts files
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Load all spec files (require.context is provided by webpack at runtime)
declare const require: any;
const context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);
