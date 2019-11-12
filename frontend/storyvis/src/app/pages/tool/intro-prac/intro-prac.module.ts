import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IntroPracComponent } from './intro-prac.component';
import { HttpClientModule } from '@angular/common/http';

import { ProvenanceService } from '../../../shared/_services';

import { FormsModule } from '@angular/forms';

import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: IntroPracComponent }
  ];

@NgModule({
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [IntroPracComponent],
    providers: [ProvenanceService],
    exports: [IntroPracComponent]
})

export class IntroPracModule { }