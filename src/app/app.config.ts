import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideMarkdown()
  ]
};
