import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { resource, computed } from '@angular/core';

export const UserResourceStore = signalStore(
    // We don't need to manually manage the state for 'loading' or 'users'
    withProps(() => ({
        // Define the resource directly
        _usersResource: resource({
            loader: async () => {
                const res = await fetch('https://jsonplaceholder.typicode.com/users');
                return (await res.json()) as any[];
            },
        })
    })),

    withProps((store) => ({
        usersResource: store._usersResource.asReadonly(),
    })),

    withComputed((store) => ({
        users: computed(() => store.usersResource.value() ?? []),
        isLoading: computed(() => store.usersResource.isLoading()),
        error: computed(() => store.usersResource.error()),
    })),

    withMethods((store) => ({
        refresh() {
            store._usersResource.reload();
        }
    }))
);

@Component({
    selector: 'signal-store-with-resource',
    imports: [CommonModule, MarkdownComponent],
    providers: [UserResourceStore],
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
export class SignalStoreWithResourceComponent {
    readonly store = inject(UserResourceStore);

    refresh() {
        this.store.refresh();
    }

    markdown = `
The component below uses the "standard" way to implement with fetch. To have control about the request status, isLoading, error, ... have to be managed manually. 

\`\`\`typescript

export const UserResourceStore = signalStore(
    // We don't need to manually manage the state for 'loading' or 'users'
    withProps(() => ({
        // Define the resource directly
        _usersResource: resource({
            loader: async () => {
                const res = await fetch('https://jsonplaceholder.typicode.com/users');
                return (await res.json()) as any[];
            },
        })
    })),
    withProps((store) => ({
        usersResource: store._usersResource.asReadonly(),
    })),
    withComputed((store) => ({
        users: computed(() => store.usersResource.value() ?? []),
        isLoading: computed(() => store.usersResource.isLoading()),
        error: computed(() => store.usersResource.error()),
    }),
    )
);
\`\`\`

**IMPORTANT**: If you use Resource API, it is loaded automatically when instantiated. If you want to refresh the data, you have to call the refresh() method.

---
`;
}