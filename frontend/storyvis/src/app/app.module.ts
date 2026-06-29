import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { ErrorInterceptor } from './shared/_helpers';
import { AlertService, UserService } from './shared/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { ProvenanceService } from './shared/_services';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ComponentsModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        AlertService,
        UserService,
        ProvenanceService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
