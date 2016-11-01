import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from 'src/shared';
import { TracklistsModule } from 'src/tracklists';

import { SearchBarComponent } from './components/search-bar';
import { SearchPageComponent } from './pages/search-page';

import { SearchActions } from './search-actions';
import { SearchEffects } from './search-effects';
import { SearchService } from './search-service';


export { SearchActions, SearchService };
export { searchReducer } from './reducers/search-reducer';
export { SearchState } from './reducers/search-state';


const routes: Routes = [
  {path: 'search', component: SearchPageComponent}
];


@NgModule({
  declarations: [
    SearchBarComponent,
    SearchPageComponent
  ],
  exports: [
    SearchBarComponent
  ],
  imports: [
    EffectsModule.run(SearchEffects),
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TracklistsModule
  ],
  providers: [
    SearchActions,
    SearchService
  ]
})
export class SearchModule {}
