import { Observable } from 'rxjs/Observable';


export interface Selector<T,V> {
  (observable$: Observable<T>): Observable<V>;
}
