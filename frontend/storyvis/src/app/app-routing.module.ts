import { NgModule }              from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/shared/login/login.component';
import { NotFoundComponent } from './pages/shared/not-found/not-found.component';
import { ThanksComponent } from './pages/shared/thanks/thanks.component';
import { RegisterComponent } from './pages/shared/register/register.component';
import { HomeComponent } from './pages/shared/home/home.component';

import { AuthGuard } from './shared/_helpers';
import { Role } from './shared/_models';
import { TutorialComponent } from './pages/shared/tutorial/tutorial.component';
import { QuestionnaireComponent } from './pages/shared/questionnaire/questionnaire.component';
import { IntroComponent } from './pages/shared/intro/intro.component';
import { IntroReadComponent } from './pages/tool/intro-read/intro-read.component';
import { IntroPracComponent } from './pages/tool/intro-prac/intro-prac.component';
import { IntroExploComponent } from './pages/tool/intro-explo/intro-explo.component';

const appRoutes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'intro',
        canActivate: [AuthGuard],
        component: IntroComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'tutorial',
        canActivate: [AuthGuard],
        component: TutorialComponent
    },
    {
        path: 'questionnaire',
        canActivate: [AuthGuard],
        component: QuestionnaireComponent

    },
    {
        path: 'reading-story',
        loadChildren: () => import('./pages/tool/reading-story/reading-story.module').then(mod => mod.ReadingStoryModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'reading-report',
        loadChildren: () => import('./pages/tool/reading-report/reading-report.module').then(mod => mod.ReadingReportModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-read',
        component: IntroReadComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-prac',
        component: IntroPracComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'intro-explo',
        component: IntroExploComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'exploration',
        loadChildren: () => import('./pages/tool/exploration/exploration.module').then(mod => mod.ExplorationModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'practice',
        loadChildren: () => import('./pages/tool/practice/practice.module').then(mod => mod.PracticeModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'thanks',
        component: ThanksComponent
    },

    { path: '**', component: NotFoundComponent }
];


@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
  })

export class AppRoutingModule {}