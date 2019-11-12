import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './pages/shared/not-found/not-found.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/shared/login/login.component';
import { ThanksComponent } from './pages/shared/thanks/thanks.component';
import { RegisterComponent } from './pages/shared/register/register.component';
import { HomeComponent } from './pages/shared/home/home.component';

import { AlertComponent } from './shared/_directives';
import { AuthGuard } from './shared/_helpers';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor } from './shared/_helpers';
import { AlertService, AuthenticationService, UserService } from './shared/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { ToolModule } from './pages/tool/tool.module';
import { ProvenanceService } from './shared/_services';
import { IntroComponent } from './pages/shared/intro/intro.component';
import { QuestionnaireComponent } from './pages/shared/questionnaire/questionnaire.component';
import { TutorialComponent } from './pages/shared/tutorial/tutorial.component';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ToolModule,
        HttpModule
        ],
    declarations: [
        AppComponent,
        NotFoundComponent,
        LoginComponent,
        AdminComponent,
        ThanksComponent,
        AlertComponent,
        RegisterComponent,
        HomeComponent,
        IntroComponent,
        QuestionnaireComponent,
        TutorialComponent
    ],
    bootstrap: [AppComponent],
    providers: [
        AuthGuard,
        AlertService,
        AuthenticationService,
        UserService,
        ProvenanceService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
})

export class AppModule { }