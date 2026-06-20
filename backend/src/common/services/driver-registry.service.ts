import { Injectable } from '@nestjs/common';

type DriverLocation = {
    lat: number;
    lng: number;
};

@Injectable()
export class DriverRegistryService {
    private onlineDrivers =
        new Map<string, string>();

    private driverLocations =
        new Map<string, DriverLocation>();

    setOnlineDriver(
        driverId: string,
        socketId: string,
    ) {
        this.onlineDrivers.set(
            driverId,
            socketId,
        );
    }

    setDriverLocation(
        driverId: string,
        location: DriverLocation,
    ) {
        this.driverLocations.set(
            driverId,
            location,
        );
    }

    removeDriver(driverId: string) {
        this.onlineDrivers.delete(
            driverId,
        );

        this.driverLocations.delete(
            driverId,
        );
    }

    getDriverLocations() {
        return this.driverLocations;
    }
}
