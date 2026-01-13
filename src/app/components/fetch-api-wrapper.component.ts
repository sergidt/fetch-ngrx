import { CommonModule } from "@angular/common";
import { Component, inject, Injectable, InjectionToken } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { resource, computed } from '@angular/core';
import { User } from "../models";



const GlobalRequestInit: InjectionToken<RequestInit> = new InjectionToken<RequestInit>('GlobalRequestInit');

@Injectable({ providedIn: 'root' })
export class FetchApiClient {
    private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

    globalRequestInit = inject(GlobalRequestInit, { optional: true });

    /**
     * Generic method to perform HTTP requests.
     * @param path The API path (ex: '/users')
     * @param options Additional configuration (method, body, signal, etc.)
     */
    async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        // If method is not provided, we put GET by default
        const method = options.method || 'GET';

        // Headers globals
        const headers: HeadersInit = {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'X-App-Version': '1.0.0',
            ...(this.globalRequestInit?.headers || options.headers), // Always prefer global headers. If not provided, headers by parameter
        };

        const config: RequestInit = {
            ...(this.globalRequestInit || options),
            method,
            headers
        };

        // When sending data (POST/PUT), the body has to be coded as a JSON string, unless you are sending FormData
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Expired session');
            }
            throw new Error(`API Error (${method} ${path}): ${response.status}`);
        }

        // Retrun parsed json
        return response.json();
    }

    // Other methods (for having a cleaner code)
    get<T>(path: string, options?: RequestInit) {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    post<T>(path: string, body: any, options?: RequestInit) {
        return this.request<T>(path, { ...options, method: 'POST', body });
    }

    put<T>(path: string, body: any, options?: RequestInit) {
        return this.request<T>(path, { ...options, method: 'PUT', body });
    }

    delete<T>(path: string, options?: RequestInit) {
        return this.request<T>(path, { ...options, method: 'DELETE' });
    }
}


const UserResourceStore = signalStore(
    // Global Services for the store
    withProps(() => ({
        _apiClient: inject(FetchApiClient),
    })),

    withProps((store) => ({
        // Define the resource directly
        _usersResource: resource({
            loader: () => store._apiClient.get<User[]>('/users')
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
    selector: 'fetch-api-wrapper',
    imports: [CommonModule, MarkdownComponent],
    providers: [
        {
            provide: GlobalRequestInit,
            useValue: {
                headers: {
                    //   'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'X-App-Version': '1.0.0',
                }
            }
        },
        FetchApiClient,
        UserResourceStore,
    ],
    template: `
 <markdown [data]="markdown" class="variable-binding"> </markdown>

    <h3 class="title is-5 top-margin">Users list with Fetch API wrapper</h3>
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
export class FetchApiWrapperComponent {
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