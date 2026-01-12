import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgrxFetchComponent } from './ngrx-fetch.component';

@Component({
  selector: 'app-root',
  imports: [NgrxFetchComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fetch-ngrx');
}
