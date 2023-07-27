import {NgModule} from '@angular/core';
import {MainComponent} from '@/components/main/main.component';
import {RouterModule, Routes} from '@angular/router';
import {FiveElementsComponent} from '@/components/five-elements/five-elements.component';

const routes: Routes = [
  {path: 'five-elements', component: FiveElementsComponent},
  {path: '', component: MainComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
