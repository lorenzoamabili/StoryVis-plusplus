import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly KEY = 'storyvis_session_id';

    getId(): string {
        let id = localStorage.getItem(this.KEY);
        if (!id) {
            id = this.generateUUID();
            localStorage.setItem(this.KEY, id);
        }
        return id;
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}
