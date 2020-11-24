import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthGuard } from './shared/_helpers';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor } from './shared/_helpers';
import { AlertService, AuthenticationService, UserService } from './shared/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { ComponentsModule } from './components/components.module';
import { ExplorationModule } from './pages/tool/exploration/exploration.module';
import { PracticeModule } from './pages/tool/practice/practice.module';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './pages/shared/not-found/not-found.component';
import { LoginComponent } from './pages/shared/login/login.component';
import { ThanksComponent } from './pages/shared/thanks/thanks.component';
import { RegisterComponent } from './pages/shared/register/register.component';
import { HomeComponent } from './pages/shared/home/home.component';

import { ProvenanceService } from './shared/_services';
import { IntroComponent } from './pages/shared/intro/intro.component';
import { QuestionnaireComponent } from './pages/shared/questionnaire/questionnaire.component';
import { IntroPracComponent } from './pages/tool/intro-prac/intro-prac.component';
import { IntroExploComponent } from './pages/tool/intro-explo/intro-explo.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        HttpModule,
        PracticeModule,
        ExplorationModule,
        ComponentsModule
        ],
    declarations: [
        AppComponent,
        NotFoundComponent,
        LoginComponent,
        ThanksComponent,
        RegisterComponent,
        HomeComponent,
        IntroComponent,
        QuestionnaireComponent,
        IntroPracComponent,
        IntroExploComponent
    ],
    providers: [
        AuthGuard,
        AlertService,
        AuthenticationService,
        UserService,
        ProvenanceService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }