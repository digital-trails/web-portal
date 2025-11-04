import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'simpleId' })
export class SimpleIdPipe implements PipeTransform {
  transform(value: string): string {
    return value.includes('@') ? value.slice(0, value.indexOf('@')) : value;
  }
}
