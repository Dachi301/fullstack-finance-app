import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideLoadingBarRouter } from '@ngx-loading-bar/router';
import { provideLoadingBarInterceptor } from '@ngx-loading-bar/http-client';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { transactionsReducer } from './store/transactions/transactions.reducer';
import { TransactionsEffects } from './store/transactions/transactions.effects';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    provideLoadingBarRouter(),
    provideLoadingBarInterceptor(),
    provideStore({ transactions: transactionsReducer }),
    provideEffects([TransactionsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ],
};