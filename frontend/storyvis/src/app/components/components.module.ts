import { NgModule } from '@angular/core';
import { BrainvisCanvasComponent } from './brainvis-canvas/brainvis-canvas.component';
import { BrainvisCanvasControlsComponent } from './brainvis-canvas-controls/brainvis-canvas-controls.component';
import { ProvenanceVisualizationComponent } from './provenance-visualization/provenance-visualization.component';
import { ProvenanceSlidesComponent } from './provenance-slides/provenance-slides.component';
import { StyledSliderComponent } from './brainvis-canvas-controls/styled-slider/styled-slider.component';
import { SlidesContainerComponent } from './slides-container/slides-container.component';
import { TextReportComponent } from './text-report/text-report.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

import {
    MatIconModule, MatSidenavModule, MatSlideToggleModule, MatSliderModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatRadioModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonToggleModule,
    MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule,
    MatExpansionModule, MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule,
    MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRippleModule, MatSnackBarModule, MatSortModule,
    MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule, MatTabGroup, MatTab
} from '@angular/material';

import { Ng5SliderModule } from 'ng5-slider';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
        Ng5SliderModule, MatTabsModule
    ],
    declarations: [
        BrainvisCanvasComponent,
        BrainvisCanvasControlsComponent,
        ProvenanceVisualizationComponent,
        ProvenanceSlidesComponent,
        StyledSliderComponent,
        SlidesContainerComponent,
        TextReportComponent,
        MenuBarComponent
    ],
    exports: [
        BrainvisCanvasComponent,
        BrainvisCanvasControlsComponent,
        ProvenanceVisualizationComponent,
        ProvenanceSlidesComponent,
        StyledSliderComponent,
        SlidesContainerComponent,
        MenuBarComponent,
        TextReportComponent
    ]
})

export class ComponentsModule { }