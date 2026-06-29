import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User, Provenance, Story, ProvenanceStudy, StoryStudy, TextReport, TextReportStudy } from '../_models';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }

    register(user: User) {
        return this.http.post<User>(`${environment.apiUrl}/users/register`, user);
    }

    delete(id: string) {
        return this.http.delete<User>(`${environment.apiUrl}/users/${id}`);
    }

    getAllGraphs(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<Provenance[]>(`${environment.apiUrl}/provGraphs${params}`);
    }

    getByIdGraphs(id: string) {
        return this.http.get<Provenance>(`${environment.apiUrl}/provGraphs/${id}`);
    }

    deleteGraphs(id: string) {
        return this.http.delete<Provenance>(`${environment.apiUrl}/provGraphs/${id}`);
    }

    getAllStories(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<Story[]>(`${environment.apiUrl}/stories${params}`);
    }

    getByIdStories(id: string) {
        return this.http.get<Story>(`${environment.apiUrl}/stories/${id}`);
    }

    deleteStories(id: string) {
        return this.http.delete<Story>(`${environment.apiUrl}/stories/${id}`);
    }

    getAllGraphsStudy(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<ProvenanceStudy[]>(`${environment.apiUrl}/provGraphsStudy${params}`);
    }

    getByIdGraphsStudy(id: string) {
        return this.http.get<ProvenanceStudy>(`${environment.apiUrl}/provGraphsStudy/${id}`);
    }

    deleteGraphsStudy(id: string) {
        return this.http.delete<ProvenanceStudy>(`${environment.apiUrl}/provGraphsStudy/${id}`);
    }

    getAllStoriesStudy(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<StoryStudy[]>(`${environment.apiUrl}/storiesStudy${params}`);
    }

    getByIdStoriesStudy(id: string) {
        return this.http.get<StoryStudy>(`${environment.apiUrl}/storiesStudy/${id}`);
    }

    deleteStoriesStudy(id: string) {
        return this.http.delete<StoryStudy>(`${environment.apiUrl}/storiesStudy/${id}`);
    }

    getAllTextReports(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<TextReport[]>(`${environment.apiUrl}/textReports${params}`);
    }

    getByIdTextReports(id: string) {
        return this.http.get<TextReport>(`${environment.apiUrl}/textReports/${id}`);
    }

    deleteTextReports(id: string) {
        return this.http.delete<TextReport>(`${environment.apiUrl}/textReports/${id}`);
    }

    getAllTextReportsStudy(IDcreator?: string) {
        const params = IDcreator ? `?IDcreator=${encodeURIComponent(IDcreator)}` : '';
        return this.http.get<TextReportStudy[]>(`${environment.apiUrl}/textReportsStudy${params}`);
    }

    getByIdTextReportsStudy(id: string) {
        return this.http.get<TextReportStudy>(`${environment.apiUrl}/textReportsStudy/${id}`);
    }

    deleteTextReportsStudy(id: string) {
        return this.http.delete<TextReportStudy>(`${environment.apiUrl}/textReportsStudy/${id}`);
    }
}
