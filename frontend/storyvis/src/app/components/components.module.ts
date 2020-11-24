import { NgModule } from '@angular/core';
import { BrainvisCanvasComponent } from './brainvis-canvas/brainvis-canvas.component';
import { ProvenanceVisualizationComponent } from './provenance-visualization/provenance-visualization.component';
import { ProvenanceSlidesComponent } from './provenance-slides/provenance-slides.component';
import { StyledSliderPracticeComponent } from './styled-slider-practice/styled-slider-practice.component';
import { StyledSliderExplorationComponent } from './styled-slider-exploration/styled-slider-exploration.component';
import { SlidesContainerComponent } from './slides-container/slides-container.component';
import { TextReportComponent } from './text-report/text-report.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { NgxSliderModule } from '@m0t0r/ngx-slider';
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
        NgxSliderModule, MatTabsModule
    ],
    declarations: [
        BrainvisCanvasComponent,
        ProvenanceVisualizationComponent,
        ProvenanceSlidesComponent,
        StyledSliderPracticeComponent,
        StyledSliderExplorationComponent,
        SlidesContainerComponent,
        TextReportComponent,
        MenuBarComponent
    ],
    exports: [
        BrainvisCanvasComponent,
        ProvenanceVisualizationComponent,
        ProvenanceSlidesComponent,
        StyledSliderPracticeComponent,
        StyledSliderExplorationComponent,
        SlidesContainerComponent,
        MenuBarComponent,
        TextReportComponent
    ]
})

export class ComponentsModule { }