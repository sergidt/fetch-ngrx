import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

@Component({
    selector: 'markdown-fetch-vs-resource',
    imports: [CommonModule, MarkdownComponent],
    template: `
    <h2 class="title is-4">Differences</h2>
 <markdown [data]="markdown1"> </markdown>

     <h2 class="title is-4 top-margin">Workflow</h2>
      <markdown [data]="markdown2"> </markdown>
    `
})
export class MarkdownFetchVsResourceComponent {
    markdown1 = `

| Feature    | Fetch API | Resource |
| -------- | ------- | ------- |
| Loading state | Manual | Automatic |
| Error handling | Manual | Automatic |
| Controlling the request | Manual. You have to manage the request lifecycle. | Automatic. Angular manages the request lifecycle. |
| Boilerplate | High: more code (patchState, try/catch, isLoading, error, etc.) | Low: less code, is managed internally. |
| Reactivity | Calls are made manually. | Calls are made automatically (can react to any change, using the request signal). |
| Caching | Manual | Automatic |
| Cancellation | Manual: you have to cancel the request manually, using the abort controller. | Automatic: the request is cancelled automatically when new request is made or the component is destroyed. |
---

**Important**: Resource is in Development Preview and it is not recommended to use it in production. This API can suffer breaking changes in the future.
`;

    markdown2 = `
| | Rxjs | Fetch API | Angular Resource |
| -------- | ------- | ------- | ------- |
| tool | tapResponse| try...catch | Automatic |
|where is it defined? | Using a pipe operator | inside an async function | inside the loader function |
| State management | Manual: patchState | Manual: patchState | Automatic: resource's signals |
`;
}