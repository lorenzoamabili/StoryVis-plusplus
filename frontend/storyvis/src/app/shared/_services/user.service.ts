import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User, Provenance, Story, ProvenancePractice, StoryPractice, TextReport, TextReportPractice } from '../_models';

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

    getAllGraphs() {
        return this.http.get<Provenance[]>(`${environment.apiUrl}/provGraphs`);
    }

    getByIdGraphs(id: string) {
        return this.http.get<Provenance>(`${environment.apiUrl}/provGraphs/${id}`);
    }

    deleteGraphs(id: string) {
        return this.http.delete<Provenance>(`${environment.apiUrl}/provGraphs/${id}`);
    }

    getAllStories() {
        return this.http.get<Story[]>(`${environment.apiUrl}/stories`);
    }

    getByIdStories(id: string) {
        return this.http.get<Story>(`${environment.apiUrl}/stories/${id}`);
    }

    deleteStories(id: string) {
        return this.http.delete<Story>(`${environment.apiUrl}/stories/${id}`);
    }
    getAllGraphsPractice() {
        return this.http.get<ProvenancePractice[]>(`${environment.apiUrl}/provGraphsPractice`);
    }

    getByIdGraphsPractice(id: string) {
        return this.http.get<ProvenancePractice>(`${environment.apiUrl}/provGraphsPractice/${id}`);
    }

    deleteGraphsPractice(id: string) {
        return this.http.delete<ProvenancePractice>(`${environment.apiUrl}/provGraphsPractice/${id}`);
    }

    getAllStoriesPractice() {
        return this.http.get<StoryPractice[]>(`${environment.apiUrl}/storiesPractice`);
    }

    getByIdStoriesPractice(id: string) {
        return this.http.get<StoryPractice>(`${environment.apiUrl}/storiesPractice/${id}`);
    }

    deleteStoriesPractice(id: string) {
        return this.http.delete<StoryPractice>(`${environment.apiUrl}/storiesPractice/${id}`);
    }

    getAllTextReports() {
        return this.http.get<TextReport[]>(`${environment.apiUrl}/textReports`);
    }

    getByIdTextReports(id: string) {
        return this.http.get<TextReport>(`${environment.apiUrl}/textReports/${id}`);
    }

    deleteTextReports(id: string) {
        return this.http.delete<TextReport>(`${environment.apiUrl}/textReports/${id}`);
    }

    getAllTextReportsPractice() {
        return this.http.get<TextReportPractice[]>(`${environment.apiUrl}/textReportsPractice`);
    }

    getByIdTextReportsPractice(id: string) {
        return this.http.get<TextReportPractice>(`${environment.apiUrl}/textReportsPractice/${id}`);
    }

    deleteTextReportsPractice(id: string) {
        return this.http.delete<TextReportPractice>(`${environment.apiUrl}/textReportsPractice/${id}`);
    }
}