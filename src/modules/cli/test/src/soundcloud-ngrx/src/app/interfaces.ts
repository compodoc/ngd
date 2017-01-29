import { PlayerState, TimesState } from './.';
import { SearchState } from './.';
import { TracklistsState, TracksState } from './.';
import { UsersState } from './.';


export interface AppState {
  player: PlayerState;
  search: SearchState;
  times: TimesState;
  tracklists: TracklistsState;
  tracks: TracksState;
  users: UsersState;
}
