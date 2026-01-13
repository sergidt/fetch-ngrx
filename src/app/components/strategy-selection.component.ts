import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

@Component({
    selector: 'strategy-selection',
    imports: [CommonModule, MarkdownComponent],
    template: `
 <markdown [data]="markdown1"> </markdown>
    `
})
export class StrategySelectionComponent {
    markdown1 = `
    ## Which strategy should I choose?
    - If you have many interceptors: Use Strategy 2 (Hybrid). It is the fastest and most compatible. You don't have to rewrite any of your security layer.
    - If you want to be 100% independent of RxJS: Use Strategy 1 (Wrapper). It is the most modern and follows the Web API standards.
    - If you are building a new app from scratch: I recommend Strategy 1. It allows total portability and the code is much easier to test without the heavy context of HttpClientModule.
  
  ##Should I use Fetch API for simple requests?
  Yes, Fetch API or Wrapper is a good choice. Prefer it:

  - Better connection with Signals: resource() and computed() work natively with Promises. The code is much cleaner (async/await) than the RxJS pipe.

  - No subscriptions: With Fetch you don't have to worry about whether you have done .unsubscribe() or whether take(1) is in the right place.

  - Standard Web: Fetch is part of the browser. You don't depend on an external library (RxJS) that has a high learning curve for new developers.

  - Bundle size: In the long run, if your app doesn't use HttpClient, the final bundle is smaller.

  ## When should I use HttpClient?

  HttpClient still make sense in specific scenarios:

  - Interceptors existents: If your company already has a huge infrastructure of interceptors for telemetry, security and logging, it's not worth re-writing it all to a Fetch wrapper.

  - Upload/Download progress: If you need to show a progress bar for uploading a file (ReportProgress), HttpClient handles it much better than Fetch.

  - Complex retries: If you need complex retry logic (e.g: "try 3 times with exponential backoff"), RxJS operators like retry are unbeatable.
    
  **CONSIDERATIONS:**
  
  #### For most typical REST requests (GET lists, POST forms, DELETE), the use of Fetch API + Resource API is the way to go. It is easier to read, easier to test and is totally aligned with the direction that Angular is taking (a future "zoneless" and based on signals).**
    ---
`;
}