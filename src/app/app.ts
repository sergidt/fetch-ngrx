import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalStoreWithFetchComponent } from './signal-store-with-fetch.component';
import { SignalStoreWithResourceComponent } from "./signal-store-with-resource.component";
import { MarkdownFetchVsResourceComponent } from "./markdown-fetch-vs-resource.component";
import { SignalStoreWithHttpResourceComponent } from "./signal-store-with-httpresource.component";
import { MarkdownAbortSignalComponent } from "./markdown-abort-signal.component";
import { AbortSignalResourceComponent } from './abort-signal-resource.component';


@Component({
  selector: 'app-root',
  imports: [
    SignalStoreWithFetchComponent,
    SignalStoreWithResourceComponent,
    MarkdownFetchVsResourceComponent,
    SignalStoreWithHttpResourceComponent,
    MarkdownAbortSignalComponent,
    AbortSignalResourceComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
