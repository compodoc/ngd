import { RequestMethod } from '@angular/http';


//=====================================
//  REQUESTS
//-------------------------------------

export interface RequestArgs {
  method: RequestMethod;
  search: string;
  url: string;
}

export interface RequestOptions {
  method?: RequestMethod;
  paginate?: boolean;
  query?: string;
  url: string;
}


//=====================================
//  RESPONSE DATA
//-------------------------------------

export interface PaginatedData {
  collection: any[];
  next_href?: string;
}
