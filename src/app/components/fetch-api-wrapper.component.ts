import { CommonModule } from "@angular/common";
import { Component, inject, Injectable, InjectionToken } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { resource, computed } from '@angular/core';
import { User } from "../models";

export interface FetchApiConfig {
    options?: RequestInit;
    requestTimeout?: number;
}

const FetchApiConfig: InjectionToken<FetchApiConfig> = new InjectionToken<FetchApiConfig>('FetchApiConfig');

@Injectable({ providedIn: 'root' })
export class FetchApiClient {
    private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

    globalFetchApiConfig = inject(FetchApiConfig, { optional: true });

    /**
     * Generic method to perform HTTP requests.
     * @param path The API path (ex: '/users')
     * @param options Additional configuration (method, body, signal, etc.)
     */
    async fetch<T>(path: string, fetchConfig: FetchApiConfig = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        // If method is not provided, we put GET by default
        const method = fetchConfig.options?.method || 'GET';

        // Headers globals
        const headers: HeadersInit = {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'X-App-Version': '1.0.0',
            ...(fetchConfig.options?.headers || this.globalFetchApiConfig?.options?.headers || {}), // Always prefer custom headers.
        };

        // Abort signals
        let abortSignal: AbortSignal | null = null;

        // Timeout
        const timeout = fetchConfig.requestTimeout || this.globalFetchApiConfig?.requestTimeout;

        if (timeout) {
            const timeoutSignal = AbortSignal.timeout(timeout);
            // Set the timeout signal
            abortSignal = timeoutSignal;

            // If a signal is already provided, we combine it with the timeout signal
            const configSignal = fetchConfig.options?.signal;
            if (configSignal) {
                /**
                 * Combine the signals:
                 * The request will be aborted if:
                 * 1. The Resource API cancels the request (ex: the user keeps typing).
                 * 2. The timeout is exceeded.
                 */
                abortSignal = AbortSignal.any([timeoutSignal, configSignal]);
            }
        }

        const config: RequestInit = {
            ...(this.globalFetchApiConfig?.options || fetchConfig.options),
            method,
            headers
        };

        // When sending data (POST/PUT), the body has to be coded as a JSON string, unless you are sending FormData
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, { ...config, signal: abortSignal });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Expired session');
                }
                throw new Error(`API Error (${method} ${path}): ${response.statusText}`);
            }


            // Retrun parsed json
            return response.json() as T;
        } catch (error: any) {
            // Specific error handling
            if (error.name === 'TimeoutError') {
                console.error('The request has exceeded the allowed time limit.');
                throw new Error('Timeout: The server has taken too long to respond.');
            }

            if (error.name === 'AbortError') {
                console.log('Request cancelled');
                throw error; // Let the Resource API handle the cancellation
            }

            throw error;
        }
    }

    // Other methods (for having a cleaner code)
    get<T>(path: string, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'GET' } });
    }

    post<T>(path: string, body: any, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'POST', body } });
    }

    put<T>(path: string, body: any, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'PUT', body } });
    }

    delete<T>(path: string, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'DELETE' } });
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
            provide: FetchApiConfig,
            useValue: {
                options: {
                    headers: {
                        //   'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                        'X-App-Version': '1.0.0',
                    }
                },
                requestTimeout: 4000
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
export interface FetchApiConfig {
    options?: RequestInit;
    requestTimeout?: number;
}

const FetchApiConfig: InjectionToken<FetchApiConfig> = new InjectionToken<FetchApiConfig>('FetchApiConfig');

@Injectable({ providedIn: 'root' })
export class FetchApiClient {
    private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

    globalFetchApiConfig = inject(FetchApiConfig, { optional: true });

    /**
     * Generic method to perform HTTP requests.
     * @param path The API path (ex: '/users')
     * @param options Additional configuration (method, body, signal, etc.)
     */
    async fetch<T>(path: string, fetchConfig: FetchApiConfig = {}): Promise<T> {
        const url = this.baseUrl + path;

        // If method is not provided, we put GET by default
        const method = fetchConfig.options?.method || 'GET';

        // Headers globals
        const headers: HeadersInit = {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json',
            'X-App-Version': '1.0.0',
            ...(fetchConfig.options?.headers || this.globalFetchApiConfig?.options?.headers || {}), // Always prefer custom headers.
        };

        // Abort signals
        let abortSignal: AbortSignal | null = null;

        // Timeout
        const timeout = fetchConfig.requestTimeout || this.globalFetchApiConfig?.requestTimeout;

        if (timeout) {
            const timeoutSignal = AbortSignal.timeout(timeout);
            // Set the timeout signal
            abortSignal = timeoutSignal;

            // If a signal is already provided, we combine it with the timeout signal
            const configSignal = fetchConfig.options?.signal;
            if (configSignal) {
                /**
                 * Combine the signals:
                 * The request will be aborted if:
                 * 1. The Resource API cancels the request (ex: the user keeps typing).
                 * 2. The timeout is exceeded.
                 */
                abortSignal = AbortSignal.any([timeoutSignal, configSignal]);
            }
        }

        const config: RequestInit = {
            ...(this.globalFetchApiConfig?.options || fetchConfig.options),
            method,
            headers
        };

        // When sending data (POST/PUT), the body has to be coded as a JSON string, unless you are sending FormData
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, { ...config, signal: abortSignal });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Expired session');
                }
                throw new Error('API Error ('+method+' '+path+'): '+response.statusText);
            }

            // Retrun parsed json
            return response.json() as T;
        } catch (error: any) {
            // Specific error handling
            if (error.name === 'TimeoutError') {
                console.error('The request has exceeded the allowed time limit.');
                throw new Error('Timeout: The server has taken too long to respond.');
            }

            if (error.name === 'AbortError') {
                console.log('Request cancelled');
                throw error; // Let the Resource API handle the cancellation
            }

            throw error;
        }
    }

    // Other methods (for having a cleaner code)
    get<T>(path: string, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'GET' } });
    }

    post<T>(path: string, body: any, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'POST', body } });
    }

    put<T>(path: string, body: any, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'PUT', body } });
    }

    delete<T>(path: string, requestOptions?: FetchApiConfig) {
        return this.fetch<T>(path, { ...requestOptions, options: { method: 'DELETE' } });
    }
}
\`\`\`
---
`;
}