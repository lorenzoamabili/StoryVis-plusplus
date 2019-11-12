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
        path: 'tool',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/tool/tool.module').then(mod => mod.ToolModule)

    },
    {
        path: 'questionnaire',
        canActivate: [AuthGuard],
        component: QuestionnaireComponent

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