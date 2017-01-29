import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

import { AppState } from '../.';
import { Selector } from '../.';


export function getSearchQuery(): Selector<AppState,string> {
  return state$ => state$
    .map(state => state.search.query)
    .distinctUntilChanged();
}
