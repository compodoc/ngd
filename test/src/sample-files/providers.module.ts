import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
    providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: APP_BASE_HREF, useClass: 'FooService' },
        { provide: APP_BASE_HREF, useExisting: 'BarService' },
        {
            provide: 'Date', useFactory: (d1, d2) => {
                return new Date();
            }, deps: ['d1', APP_BASE_HREF]
        }
    ]
})
export class AppModule { }
