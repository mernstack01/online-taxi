import { Module } from '@nestjs/common';
import { DriverRegistryService } from './services/driver-registry.service';
import { GeolocationService } from './services/geolocation.service';

@Module({
    providers: [
        DriverRegistryService,
        GeolocationService,
    ],
    exports: [
        DriverRegistryService,
        GeolocationService,
    ],
})
export class CommonModule {}
