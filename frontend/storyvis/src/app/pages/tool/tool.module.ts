import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ToolRoutingModule } from './tool-routing.module';
import { ToolComponent } from './tool.component';
import { HttpClientModule } from '@angular/common/http';
import { ProvenanceService } from '../../shared/_services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";

import { PracticeModule } from './practice/practice.module';
import { ExplorationModule } from './exploration/exploration.module';
import { ReadingStoryModule } from './reading-story/reading-story.module';
import { ReadingReportModule } from './reading-report/reading-report.module';


import { IntroReadModule } from './intro-read/intro-read.module';
import { IntroExploModule } from './intro-explo/intro-explo.module';
import { IntroPracModule } from './intro-prac/intro-prac.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        CommonModule,
        ToolRoutingModule,
        PracticeModule,
        ExplorationModule,
        ReadingStoryModule,
        ReadingReportModule,
        IntroExploModule,
        IntroReadModule,
        IntroPracModule,
        ComponentsModule,
        RouterModule
    ],
    declarations: [
        ToolComponent
    ],
    providers: [ProvenanceService]
})

export class ToolModule { }