import { PlayerState, TimesState } from '../player';
import { SearchState } from '../search';
import { TracklistsState, TracksState } from '../tracklists';
import { UsersState } from '../users';


export interface AppState {
  player: PlayerState;
  search: SearchState;
  times: TimesState;
  tracklists: TracklistsState;
  tracks: TracksState;
  users: UsersState;
}
