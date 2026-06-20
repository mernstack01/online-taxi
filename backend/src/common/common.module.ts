import { Module } from '@nestjs/common';
import { GeolocationService } from './services/geolocation.service';

@Module({
    providers: [
        GeolocationService,
    ],
    exports: [
        GeolocationService,
    ],
})
export class CommonModule {}
