import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/_services';

@Component({ templateUrl: 'thanks.component.html', styleUrls: ['thanks.component.css'] })
export class ThanksComponent implements OnInit {

    constructor(    
        private router: Router,
        private authenticationService: AuthenticationService) { 
        
    }

    ngOnInit() {
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigateByUrl('/login');
    }
}