import { CommonModule } from "@angular/common";
import { SimpleUser } from "../models";
import { Component, inject } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { resource, computed } from '@angular/core';
import { httpResource } from "@angular/common/http";

const UserHttpResourceStore = signalStore(
    // We don't need to manually manage the state for 'loading' or 'users'
    withProps(() => ({
        // Define the resource directly
        _usersResource: httpResource<SimpleUser[]>(() => 'https://jsonplaceholder.typicode.com/users')
    })),

    withProps((store) => ({
        usersResource: store._usersResource.asReadonly(),
    })),

    withComputed((store) => ({
        users: computed(() => store.usersResource.value() ?? []),
        isLoading: computed(() => store.usersResource.isLoading()),
        error: computed(() => store.usersResource.error()),
    })
    ),

    withMethods((store) => ({
        refresh() {
            store._usersResource.reload();
        }
    }))
);

@Component({
    selector: 'signal-store-with-httpresource',
    imports: [CommonModule, MarkdownComponent],
    providers: [UserHttpResourceStore],
    template: `
 <markdown [data]="markdown" class="variable-binding"> </markdown>

    <h3 class="title is-5 top-margin">Users list</h3>
    @if (store.usersResource.isLoading()) {
      <p>Loading...</p>
    }

    @if (store.error()) {
      <p style="color: red">{{ store.error() }}</p>
    }

    <ul class="list">
      @for (user of store.users(); track user.id) {
        <li class="list-item">{{ user.name }}</li>
      }
    </ul>
    
    <button class="button" (click)="refresh()">Refresh</button>
    `,
    styles: [`
        :host {
            display: block;
        }
        `]
})
export class SignalStoreWithHttpResourceComponent {
    readonly store = inject(UserHttpResourceStore);

    refresh() {
        this.store.refresh();
    }

    markdown = `
The component below uses the "standard" way to implement with fetch. To have control about the request status, isLoading, error, ... have to be managed manually. 

\`\`\`typescript
export const UserHttpResourceStore = signalStore(
    // We don't need to manually manage the state for 'loading' or 'users'
    withProps(() => ({
        // Define the resource directly
        _usersResource: httpResource<User[]>(() => 'https://jsonplaceholder.typicode.com/users')
    })),
    withProps((store) => ({
        usersResource: store._usersResource.asReadonly(),
    })),
    withComputed((store) => ({
        users: computed(() => store.usersResource.value() ?? []),
        isLoading: computed(() => store.usersResource.isLoading()),
        error: computed(() => store.usersResource.error()),
    })
    ),
    withMethods((store) => ({
        refresh() {
            store._usersResource.reload();
        }
    }))
);
\`\`\`

httpResource is a reactive wrapper around HttpClient that gives you the request status and response as signals. You can thus use these signals with computed, effect, linkedSignal, or any other reactive API. Because it's built on top of HttpClient, httpResource supports all the same features, such as interceptors.

See [Angular documentation](https://angular.io/api/common/http/httpResource) for more details.
---
`;
}