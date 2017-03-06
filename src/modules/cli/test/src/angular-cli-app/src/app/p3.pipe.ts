import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'p3'
})
export class P3Pipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
