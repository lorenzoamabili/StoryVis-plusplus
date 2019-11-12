import { Component, OnInit } from '@angular/core';
import { User } from '../../../shared/_models';
import { AuthenticationService, ProvenanceService } from '../../../shared/_services';

@Component({ templateUrl: 'intro-read.component.html' })
export class IntroReadComponent implements OnInit {
    title = 'intro-read';

    currentUser: User;

    constructor( 
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService,
        ) {
            this.currentUser = this.authenticationService.currentUserValue;
        }

    ngOnInit() {

    }
    
    get isReportFirst() {
        return this.currentUser.username % 2 === 0;
    }
}