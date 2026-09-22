import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Angular app bootstrapped'))
  .catch(err => console.error(err));