import { Component, OnInit, Input } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuthenticationService, UserService, ProvenanceService } from '../../../shared/_services';
import { User } from '../../../shared/_models';

@Component({ templateUrl: 'reading-report.component.html', styleUrls: ['reading-report.component.css'] })

export class ReadingReportComponent implements OnInit {
    title = 'reading-report';

    currentUser: User;
    IDreader: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService, public userService: UserService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDreader = this.currentUser.username - 100;
    }

    ngOnInit() {
        this.userService.getAllTextReports().pipe(first()).subscribe(textReports => {
            for (let i = 0; i < textReports.length; i++) {
                if (textReports[i].IDcreator == this.IDreader) {
                    const IDtextReport = textReports[i]._id;
                    this.userService.getByIdTextReports(IDtextReport).pipe(first()).subscribe(textReport => {
                        this.provenance.loadTextReport(textReport);
                    });
                }
            }
        });
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

    get isReportFirst() {
        return this.currentUser.username % 2 === 0;
    }
}