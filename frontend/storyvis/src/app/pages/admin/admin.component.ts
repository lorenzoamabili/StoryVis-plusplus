import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User, Story, Provenance, Role } from '../../shared/_models';
import { UserService, AuthenticationService } from '../../shared/_services';

@Component({ templateUrl: 'admin.component.html' })
export class AdminComponent implements OnInit {
    currentUser: User;
    users: User[] = [];
    stories: Story[] = [];
    graphs: Provenance[] = [];

    constructor(private userService: UserService, private authenticationService: AuthenticationService) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.users = users;
        });
        this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
            this.graphs = graphs;
        });
        this.userService.getAllStories().pipe(first()).subscribe(stories => {
            this.stories = stories;
        });
    }


    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }


    deleteUser(id) {
        this.userService.delete(id).subscribe(() => {
            this.userService.getAll().pipe(first()).subscribe(users => {
                this.users = users;
            });
        })

    }

    deleteGraph(id) {
        this.userService.deleteGraphs(id).subscribe(() => {
            this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
                this.graphs = graphs;
            });
        })

    }

    deleteStory(id) {
        this.userService.deleteStories(id).subscribe(() => {
            this.userService.getAllStories().pipe(first()).subscribe(stories => {
                this.stories = stories;
            });
        })

    }
}