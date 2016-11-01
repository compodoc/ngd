import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from 'src/shared';

import { PlayerComponent } from './components/player';
import { PlayerControlsComponent } from './components/player-controls';
import { FormatVolumePipe } from './pipes/format-volume';

import { AUDIO_SOURCE_PROVIDER } from './audio-source';
import { PlayerActions } from './player-actions';
import { PlayerEffects } from './player-effects';
import { PlayerService } from './player-service';


export { PlayerService };
export { playerReducer } from './reducers/player-reducer';
export { PlayerState } from './reducers/player-state';
export { timesReducer } from './reducers/times-reducer';
export { TimesState, TimesStateRecord } from './reducers/times-state';


@NgModule({
  declarations: [
    // components
    PlayerComponent,
    PlayerControlsComponent,

    // pipes
    FormatVolumePipe
  ],
  exports: [
    PlayerComponent
  ],
  imports: [
    EffectsModule.run(PlayerEffects),
    SharedModule
  ],
  providers: [
    AUDIO_SOURCE_PROVIDER,
    PlayerActions,
    PlayerService
  ]
})
export class PlayerModule {}
