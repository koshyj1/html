import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'prettyDate' })
export class PrettyDatePipe implements PipeTransform {
	transform(value: any) {
        let date = new Date(value);
        return date.toDateString();
	}
}