import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { MarkdownComponent } from "ngx-markdown";

type User = { id: number; name: string };

type UserState = {
    users: User[];
    isLoading: boolean;
    error: string | null;
};

const initialState: UserState = {
    users: [],
    isLoading: false,
    error: null,
};

export const UserStore = signalStore(
    withState(initialState),
    withMethods((store) => ({
        // async/await instead of Observables
        async loadAll() {
            patchState(store, { isLoading: true, error: null });

            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/users');

                if (!response.ok) throw new Error('Error loading data');

                const data = await response.json();
                patchState(store, { users: data, isLoading: false });
            } catch (err) {
                patchState(store, {
                    error: err instanceof Error ? err.message : 'Unknown error',
                    isLoading: false
                });
            }
        },
    }))
);

@Component({
    selector: 'ngrx-fetch',
    imports: [CommonModule, MarkdownComponent],
    providers: [UserStore],
    template: `
 <markdown [data]="markdown" class="variable-binding"> </markdown>

    <h3 class="title is-5 top-margin">Users list</h3>
    @if (store.isLoading()) {
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
export class NgrxFetchComponent {
    readonly store = inject(UserStore);

    ngOnInit() {
        this.store.loadAll();
    }

    refresh() {
        this.store.loadAll();
    }

    markdown = `
The component below uses the "standard" way to implement with fetch. To have control about the request status, isLoading, error, ... have to be managed manually. 

\`\`\`typescript
export const UserStore = signalStore(
    withState(initialState),
    withMethods((store) => ({
        // async/await instead of Observables
        async loadAll() {
            patchState(store, { isLoading: true, error: null });

            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/users');

                if (!response.ok) throw new Error('Error loading data');

                const data = await response.json();
                patchState(store, { users: data, isLoading: false });
            } catch (err) {
                patchState(store, {
                    error: err instanceof Error ? err.message : 'Unknown error',
                    isLoading: false
                });
            }
        },
    }))
);
\`\`\`
---
`;
}