import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

@Component({
    selector: 'markdown-abort-signal',
    imports: [CommonModule, MarkdownComponent],
    template: `
 <markdown [data]="markdown1"> </markdown>

 <h3 class="title is-5 top-margin">How the standard way works (no Angular)</h3>
 <markdown [data]="markdown2"> </markdown>

 <h3 class="title is-5 top-margin">Abort signal with Angular (resource)</h3>
 <markdown [data]="markdown3"> </markdown>

 <h3 class="title is-5 top-margin">What is really happening?</h3>
 <markdown [data]="markdown4"> </markdown>

 <h3 class="title is-5 top-margin">PREFER THIS APPROACH BEFORE PURE JAVASCRIPT ONE</h3>
 <markdown [data]="markdown5"> </markdown>

    `
})
export class MarkdownAbortSignalComponent {
    markdown1 = `
AbortSignal is a signal that you can pass to an asynchronous operation (like an HTTP request) to tell it that we no longer care about its result and that it should stop immediately.

In the world of Angular and the new Resource API, this mechanism substitutes the automatic cancellation that we used to have with switchMap from RxJS.
`;

    markdown2 = `
\`\`\`typescript

const controller = new AbortController();
const signal = controller.signal;

fetch('https://jsonplaceholder.typicode.com/users', { signal })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// When you want to cancel the request
controller.abort();
\`\`\`

----
`;

    markdown3 = `
    The resource API provides a way to abort a request by using the abort signal. You don't have to create an abort controller manually.

    Whenever the request changes, the previous request is automatically aborted, and the new request is started.
    When the component is destroyed, the request is automatically aborted.
\`\`\`typescript
 import { resource, signal } from '@angular/core';

// This signal changes when the user types
const query = signal('');

const userResource = resource({
  // 1. Define the dependency. When 'query' changes, the loader will execute.
  request: () => query(),

  // 2. The loader receives an object with 'request' and 'abortSignal'
  loader: async ({ request, abortSignal }) => {
    // 3. Pass the abortSignal directly to fetch
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/users?q='+request,
      { signal: abortSignal } // <--- IMPORTANT!
    );

    if (!response.ok) throw new Error('Request error');
    return await response.json();
  },
});

\`\`\`
`;

    markdown4 = `### (switchMap effect)

Let's Imagine that the user types the letter "A" and, 50ms later, types "AB":

- Search "A": The loader starts executing. The HTTP request goes out to the server.

- Search "AB": As the request parameter has changed, Angular knows that the "A" request is no longer needed.

- Cancelation: Angular activates the abortSignal of the "A" request. The browser cancels the HTTP request immediately (Canceled state in the Network tab).

- New request: The "AB" request is launched.

This is exactly the same as switchMap, but without the need for external libraries or complex operators.
`;

    markdown5 = `
If you are using a normal fetch in an async method without AbortSignal:

- If the user changes page, the request continues "alive" in the background until it ends or times out.

- You waste a lot of bandwidth and client resources unnecessarily.

- You can have race conditions: if the first request takes longer than the second, the screen data could end up being the old search.

- You can suffer memory errors, updating the non existing component.
`;
}