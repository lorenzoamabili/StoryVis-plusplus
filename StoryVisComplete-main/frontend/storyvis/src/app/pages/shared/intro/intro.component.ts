import { Component, OnInit } from '@angular/core';
import { User, Role } from '../../../shared/_models';
import { ProvenanceService, AuthenticationService } from '../../../shared/_services';

@Component({ templateUrl: 'intro.component.html' })
export class IntroComponent implements OnInit {
    title = 'intro';
    currentUser: User;
    IDcreator: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDcreator = this.currentUser.username;
  }
  ngOnInit() {
  }

    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }

    get isAuthor() {
        return this.currentUser && this.currentUser.role === Role.Author;
    }

    get isReader() {
        return this.currentUser && this.currentUser.role === Role.Reader;
    }
}