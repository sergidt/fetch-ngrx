import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

@Component({
    selector: 'service-strategy',
    imports: [CommonModule, MarkdownComponent],
    template: `
 <markdown [data]="markdown1"> </markdown>
    `
})
export class ServiceStrategyComponent {
    markdown1 = `
    The service expose a method to perform the HTTP request. The component calls this method to perform the request.
    Every service's method can be implemented in different ways:
    - Using the Fetch API
    - Using HttpClient

**The service is consumed by a resource.**
    ---
`;
}