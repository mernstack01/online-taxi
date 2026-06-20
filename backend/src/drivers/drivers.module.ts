import { Module } from '@nestjs/common';
import { DriverRegistryService } from './driver-registry.service';

@Module({
    providers: [
        DriverRegistryService,
    ],
    exports: [
        DriverRegistryService,
    ],
})
export class DriversModule {}
