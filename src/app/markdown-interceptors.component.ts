import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

@Component({
    selector: 'markdown-interceptors',
    imports: [CommonModule, MarkdownComponent],
    template: `
 <h3 class="title is-5 top-margin">How to deal with interceptors?</h3>
 <markdown [data]="markdown1"> </markdown>
    `
})
export class MarkdownInterceptorsComponent {
    markdown1 = `
### How headers are handled? 

This is a key question. When you switch from using Angular's HttpClient to the Fetch API (which is what we use inside a resource loader), you lose the automatic connection to classic Angular interceptors.

Angular interceptors (HttpInterceptorFn) are designed specifically for HttpClient. If you do a fetch(), the request goes "outside" the Angular system and will not see any authentication tokens or headers you have defined in the interceptors.
`;
}