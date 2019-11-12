import { NgModule }              from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToolComponent } from './tool.component';

import { AuthGuard } from '../../shared/_helpers';

const toolRoutes: Routes = [
    {
        path: '',
        component: ToolComponent,        
        canActivate: [AuthGuard]
    },
    {
        path: 'reading-story',
        loadChildren: () => import('./reading-story/reading-story.module').then(mod => mod.ReadingStoryModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'reading-report',
        loadChildren: () => import('./reading-report/reading-report.module').then(mod => mod.ReadingReportModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-read',
        loadChildren: () => import('./intro-read/intro-read.module').then(mod => mod.IntroReadModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-prac',
        loadChildren: () => import('./intro-prac/intro-prac.module').then(mod => mod.IntroPracModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-explo',
        loadChildren: () => import('./intro-explo/intro-explo.module').then(mod => mod.IntroExploModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'exploration',
        loadChildren: () => import('./exploration/exploration.module').then(mod => mod.ExplorationModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'practice',
        loadChildren: () => import('./practice/practice.module').then(mod => mod.PracticeModule),
        canActivate: [AuthGuard]
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(toolRoutes)],
    exports: [RouterModule]
  })

export class ToolRoutingModule {}