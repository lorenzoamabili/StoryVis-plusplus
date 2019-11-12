import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProvenanceService } from './shared/_services';

import { AuthenticationService } from './shared/_services';
import { User, Role } from './shared/_models';

@Component({
    selector: 'app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    currentUser: User;
    title = 'app';
    private bottomDrawerOpen = true;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
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

    get isProvGraph() {
        return this.currentUser && this.currentUser.group === "ProvGraph";
    }

    get isPlotTrimmerG() {
        return this.currentUser && this.currentUser.group === "PlotTrimmerG";
    }

    get isPlotTrimmerC() {
        return this.currentUser && this.currentUser.group === "PlotTrimmerC";
    }

    get isNoProvGraph() {
        return this.currentUser && this.currentUser.group === "NoProvGraph";
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigateByUrl('/login');
    }

    toggleBottomDrawer() {
        this.bottomDrawerOpen = !this.bottomDrawerOpen;
    }
}