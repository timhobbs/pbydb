import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'processPercentage',
})
export class ProcessPercentagePipe implements PipeTransform {
    transform(total: number, process: number): number {
        let result = Math.ceil(process / total * 100);
        if (result > 100) {
            result = 100;
        }

        console.log('***** result', result);

        return result;
    }
}
