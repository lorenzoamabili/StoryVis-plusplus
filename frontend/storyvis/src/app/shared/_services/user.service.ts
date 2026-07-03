import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User, Provenance, Story, ProvenanceStudy, StoryStudy, TextReport, TextReportStudy } from '../_models';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient) { }

    private _url(resource: string, idOrCreator?: string, byCreator = false): string {
        if (!idOrCreator) { return `${environment.apiUrl}/${resource}`; }
        return byCreator
            ? `${environment.apiUrl}/${resource}?IDcreator=${encodeURIComponent(idOrCreator)}`
            : `${environment.apiUrl}/${resource}/${idOrCreator}`;
    }

    getAll()                  { return this.http.get<User[]>(`${environment.apiUrl}/users`); }
    getById(id: string)       { return this.http.get<User>(this._url('users', id)); }
    register(user: User)      { return this.http.post<User>(`${environment.apiUrl}/users/register`, user); }
    delete(id: string)        { return this.http.delete<User>(this._url('users', id)); }

    getAllGraphs(IDcreator?: string)       { return this.http.get<Provenance[]>(this._url('provGraphs', IDcreator, true)); }
    getByIdGraphs(id: string)             { return this.http.get<Provenance>(this._url('provGraphs', id)); }
    deleteGraphs(id: string)              { return this.http.delete<Provenance>(this._url('provGraphs', id)); }

    getAllStories(IDcreator?: string)      { return this.http.get<Story[]>(this._url('stories', IDcreator, true)); }
    getByIdStories(id: string)            { return this.http.get<Story>(this._url('stories', id)); }
    deleteStories(id: string)             { return this.http.delete<Story>(this._url('stories', id)); }

    getAllGraphsStudy(IDcreator?: string)  { return this.http.get<ProvenanceStudy[]>(this._url('provGraphsStudy', IDcreator, true)); }
    getByIdGraphsStudy(id: string)        { return this.http.get<ProvenanceStudy>(this._url('provGraphsStudy', id)); }
    deleteGraphsStudy(id: string)         { return this.http.delete<ProvenanceStudy>(this._url('provGraphsStudy', id)); }

    getAllStoriesStudy(IDcreator?: string) { return this.http.get<StoryStudy[]>(this._url('storiesStudy', IDcreator, true)); }
    getByIdStoriesStudy(id: string)       { return this.http.get<StoryStudy>(this._url('storiesStudy', id)); }
    deleteStoriesStudy(id: string)        { return this.http.delete<StoryStudy>(this._url('storiesStudy', id)); }

    getAllTextReports(IDcreator?: string)  { return this.http.get<TextReport[]>(this._url('textReports', IDcreator, true)); }
    getByIdTextReports(id: string)        { return this.http.get<TextReport>(this._url('textReports', id)); }
    deleteTextReports(id: string)         { return this.http.delete<TextReport>(this._url('textReports', id)); }

    getAllTextReportsStudy(IDcreator?: string) { return this.http.get<TextReportStudy[]>(this._url('textReportsStudy', IDcreator, true)); }
    getByIdTextReportsStudy(id: string)       { return this.http.get<TextReportStudy>(this._url('textReportsStudy', id)); }
    deleteTextReportsStudy(id: string)        { return this.http.delete<TextReportStudy>(this._url('textReportsStudy', id)); }
}
