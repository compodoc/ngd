import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from 'src/shared';
import { TracklistsModule } from 'src/tracklists';

import { HomePageComponent } from './pages/home-page';


const routes: Routes = [
  {path: '', component: HomePageComponent}
];


@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    TracklistsModule
  ]
})
export class HomeModule {}
