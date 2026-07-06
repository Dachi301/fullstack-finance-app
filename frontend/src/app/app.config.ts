import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideLoadingBarRouter } from '@ngx-loading-bar/router';
import { provideLoadingBarInterceptor } from '@ngx-loading-bar/http-client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideLoadingBarRouter(),
    provideLoadingBarInterceptor(),
  ],
};