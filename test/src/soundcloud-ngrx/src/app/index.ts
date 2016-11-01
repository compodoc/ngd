import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { CoreModule } from 'src/core';
import { HomeModule } from 'src/home';
import { PlayerModule, playerReducer, timesReducer } from 'src/player';
import { SearchModule, searchReducer } from 'src/search';
import { SharedModule } from 'src/shared';
import { TracklistsModule, tracklistsReducer, tracksReducer } from 'src/tracklists';
import { UsersModule, usersReducer } from 'src/users';

import { AppComponent } from './components/app';
import { AppHeaderComponent } from './components/app-header';


export { AppState } from './interfaces';


@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent,
    AppHeaderComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], {useHash: false}),

    StoreModule.provideStore({
      player: playerReducer,
      search: searchReducer,
      times: timesReducer,
      tracklists: tracklistsReducer,
      tracks: tracksReducer,
      users: usersReducer
    }),

    CoreModule,
    HomeModule,
    PlayerModule,
    SearchModule,
    SharedModule,
    TracklistsModule,
    UsersModule
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'}
  ]
})
export class AppModule {}
