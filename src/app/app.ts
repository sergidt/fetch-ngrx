import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalStoreWithFetchComponent } from './components/signal-store-with-fetch.component';
import { SignalStoreWithResourceComponent } from "./components/signal-store-with-resource.component";
import { MarkdownFetchVsResourceComponent } from "./components/markdown-fetch-vs-resource.component";
import { SignalStoreWithHttpResourceComponent } from "./components/signal-store-with-httpresource.component";
import { MarkdownAbortSignalComponent } from "./components/markdown-abort-signal.component";
import { AbortSignalResourceComponent } from './components/abort-signal-resource.component';
import { MarkdownInterceptorsComponent } from "./components/markdown-interceptors.component";
import { FetchApiWrapperComponent } from "./components/fetch-api-wrapper.component";
import { RxResourceComponent } from "./components/rxresource.component";
import { ServiceStrategyComponent } from "./components/service-strategy.component";
import { StrategySelectionComponent } from "./components/strategy-selection.component";


@Component({
  selector: 'app-root',
  imports: [
    SignalStoreWithFetchComponent,
    SignalStoreWithResourceComponent,
    MarkdownFetchVsResourceComponent,
    SignalStoreWithHttpResourceComponent,
    MarkdownAbortSignalComponent,
    AbortSignalResourceComponent,
    MarkdownInterceptorsComponent,
    FetchApiWrapperComponent,
    RxResourceComponent,
    ServiceStrategyComponent,
    StrategySelectionComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
