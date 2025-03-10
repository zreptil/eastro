import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ColorPickerComponent} from '@/controls/color-picker/color-picker.component';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog';
import {ColorPickerImageComponent} from '@/controls/color-picker/color-picker-image/color-picker-image.component';
import {ColorPickerMixerComponent} from '@/controls/color-picker/color-picker-mixer/color-picker-mixer.component';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {ColorPickerRGBComponent} from '@/controls/color-picker/color-picker-rgb/color-picker-rgb.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {MainComponent} from '@/components/main/main.component';
import {FormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {MaterialModule} from '@/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {LogComponent} from '@/components/log/log.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {ProgressComponent} from '@/components/progress/progress.component';
import {AutofocusDirective} from '@/_directives/autofocus.directive';
import {ElementsComponent} from '@/components/elements/elements.component';
import {AnimalsComponent} from './components/animals/animals.component';
import {AppRoutingModule} from '@/app-routing.module';
import { FiveElementsComponent } from './components/five-elements/five-elements.component';
import { AnimatorComponent } from './components/animator/animator.component';

@NgModule({ declarations: [
        AutofocusDirective,
        AppComponent,
        DialogComponent,
        ColorPickerComponent,
        ColorPickerDialog,
        ColorPickerImageComponent,
        ColorPickerMixerComponent,
        ColorPickerBaseComponent,
        ColorPickerRGBComponent,
        WhatsNewComponent,
        MainComponent,
        WelcomeComponent,
        ImpressumComponent,
        ElementsComponent,
        AnimalsComponent,
        FiveElementsComponent,
        AnimatorComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        MaterialModule,
        DragDropModule,
        LogComponent,
        ProgressComponent,
        AppRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
}
