import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IntroExploComponent } from './intro-explo.component';
import { HttpClientModule } from '@angular/common/http';

import { ProvenanceService } from '../../../shared/_services';

import { FormsModule } from '@angular/forms';

import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: IntroExploComponent }
  ];

@NgModule({
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [IntroExploComponent],
    providers: [ProvenanceService],
    exports: [IntroExploComponent]
})

export class IntroExploModule { }