import { CommonModule } from "@angular/common";
import { Component, inject, Injectable, InjectionToken } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { resource, computed } from '@angular/core';
import { User } from "../models";
import { HttpClient } from "@angular/common/http";
import { rxResource } from "@angular/core/rxjs-interop";


const UserResourceStore = signalStore(
    // Global Services for the store
    withProps(() => ({
        _httpClient: inject(HttpClient),
    })),

    withProps((store) => ({
        // Define the resource directly
        _usersResource: rxResource({
            stream: () => store._httpClient.get<User[]>('https://jsonplaceholder.typicode.com/users')
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
    selector: 'rx-resource',
    imports: [CommonModule, MarkdownComponent],
    providers: [
        UserResourceStore,
    ],
    template: `
 <markdown [data]="markdown" class="variable-binding"> </markdown>

    <h3 class="title is-5 top-margin">Users list with RxResource + HttpClient</h3>
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
export class RxResourceComponent {
    readonly store = inject(UserResourceStore);

    refresh() {
        this.store.refresh();
    }

    markdown = `
The component below uses the "standard" way to implement with fetch. To have control about the request status, isLoading, error, ... have to be managed manually. 

\`\`\`typescript
const UserResourceStore = signalStore(
    // Global Services for the store
    withProps(() => ({
        _httpClient: inject(HttpClient),
    })),

    withProps((store) => ({
        // Define the resource directly
        _usersResource: rxResource({
            stream: () => store._httpClient.get<User[]>('https://jsonplaceholder.typicode.com/users')
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

\`\`\`

** IMPORTANT: ** 
Angular's HttpClient already handles cancellation internally when the Resource is destroyed, but for reactive cancellations per parameter change, HttpClient is a bit less direct than AbortSignal.
---
`;
}