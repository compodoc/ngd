import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'p2'
})
export class P2Pipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
