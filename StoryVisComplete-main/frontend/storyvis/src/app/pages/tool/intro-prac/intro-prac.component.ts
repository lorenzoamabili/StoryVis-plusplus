import { Component, OnInit } from '@angular/core';
import { User, Role } from '../../../shared/_models';
import { AuthenticationService, ProvenanceService } from '../../../shared/_services';

@Component({ templateUrl: 'intro-prac.component.html' })
export class IntroPracComponent implements OnInit {
    title = 'intro-prac';

    currentUser: User;

    constructor( 
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
        ) {
            this.currentUser = this.authenticationService.currentUserValue;
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