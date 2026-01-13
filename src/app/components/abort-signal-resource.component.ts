import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";

import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { resource, computed } from '@angular/core';
import { User } from "../models";

const UserSearchStore = signalStore(
  withState({ query: '' }),

  withProps((store) => ({
    usersResource: resource({
      params: () => store.query(),
      loader: async ({ params, abortSignal }) => {
        // Simulate a small delay to see better the cancellation in the Network tab
        await new Promise(resolve => setTimeout(resolve, 300));

        const url = params
          ? `https://jsonplaceholder.typicode.com/users?q=${params}`
          : `https://jsonplaceholder.typicode.com/users`;

        const response = await fetch(url, { signal: abortSignal });

        return (await response.json()) as User[];
      },
    })
  })),

  withComputed((store) => ({
    users: computed(() => store.usersResource.value() ?? []),
    isLoading: computed(() => store.usersResource.isLoading()),
    error: computed(() => store.usersResource.error()),
  })),

  withMethods((store) => ({
    updateQuery(newQuery: string) {
      patchState(store, { query: newQuery });
    },
  }))
);
@Component({
  selector: 'abort-signal-resource',
  imports: [CommonModule],
  providers: [UserSearchStore],
  template: `
    <div class="container">
      <h1>Users search</h1>

      <div class="search-box">
        <input
          #searchInput
          type="text"
          placeholder="Search users by name or email..."
          [value]="store.query()"
          (input)="store.updateQuery(searchInput.value)"
        />
              <button (click)="store.updateQuery('')" class="button">Clear</button>
      </div>

      @if (store.isLoading()) {
        <div>Loading results...</div>
      }

      @if (store.error()) {
        <div class="error">⚠️ {{ store.error() }}</div>
      }

      <div class="grid">
        @for (user of store.users(); track user.id) {
          <div class="card">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <small>{{ user.company.name }}</small>
          </div>
        } @empty {
          @if (!store.isLoading()) {
            <p>No results found for "{{ store.query() }}"</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; font-family: sans-serif; }
    .search-box input { padding: 0.5rem; width: 100%; max-width: 400px; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .card { border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
    .loader { color: blue; margin-bottom: 1rem; }
    .error { color: red; }
  `]
})
export class AbortSignalResourceComponent {
  readonly store = inject(UserSearchStore);
}