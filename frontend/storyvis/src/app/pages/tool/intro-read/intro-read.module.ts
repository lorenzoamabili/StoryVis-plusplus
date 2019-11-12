import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IntroReadComponent } from './intro-read.component';
import { HttpClientModule } from '@angular/common/http';

import { ProvenanceService } from '../../../shared/_services';

import { FormsModule } from '@angular/forms';

import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: IntroReadComponent }
  ];

@NgModule({
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [IntroReadComponent],
    providers: [ProvenanceService],
    exports: [IntroReadComponent]
})

export class IntroReadModule { }