import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { ProvenanceService } from '../../../shared/_services';

import { FormsModule } from '@angular/forms';

import { CommonModule } from "@angular/common";
import { PracticeComponent } from './practice.component';
import { ComponentsModule } from 'src/app/components/components.module';

import {
    MatIconModule, MatSidenavModule, MatSlideToggleModule, MatSliderModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatRadioModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonToggleModule,
    MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule,
    MatExpansionModule, MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule,
    MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRippleModule, MatSnackBarModule, MatSortModule,
    MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule, MatTabGroup, MatTab
} from '@angular/material';

import { Ng5SliderModule } from 'ng5-slider';
import { RouterModule, Routes } from '@angular/router';
import { BrainvisCanvasComponent } from 'src/app/components/brainvis-canvas/brainvis-canvas.component';

const routes: Routes = [
    { path: '', component: PracticeComponent }
  ];

@NgModule({
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        MatIconModule, MatSidenavModule, MatSlideToggleModule, MatSliderModule, MatButtonModule, MatFormFieldModule,
        MatSelectModule, MatRadioModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonToggleModule,
        MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule,
        MatExpansionModule, MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule,
        MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRippleModule, MatSnackBarModule, MatSortModule,
        MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule,
        Ng5SliderModule, MatTabsModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [PracticeComponent],
    providers: [ProvenanceService, BrainvisCanvasComponent],
    exports: [PracticeComponent]
})

export class PracticeModule { }