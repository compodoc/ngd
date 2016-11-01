import { Map, Record } from 'immutable';


export interface SearchState extends Map<string,any> {
  query: string;
}

export const SearchStateRecord = Record({
  query: null
});
