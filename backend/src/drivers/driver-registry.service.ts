import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverRegistryService {
    private onlineDrivers =
        new Map<string, string>();

    private driverLocations =
        new Map<
            string,
            {
                lat: number;
                lng: number;
            }
        >();

    setOnlineDriver(
        driverId: string,
        socketId: string,
    ) {
        this.onlineDrivers.set(
            driverId,
            socketId,
        );
    }

    removeOnlineDriver(
        driverId: string,
    ) {
        this.onlineDrivers.delete(
            driverId,
        );

        this.driverLocations.delete(
            driverId,
        );
    }

    updateLocation(
        driverId: string,
        lat: number,
        lng: number,
    ) {
        this.driverLocations.set(
            driverId,
            {
                lat,
                lng,
            },
        );
    }

    getDriverLocations() {
        return this.driverLocations;
    }

    getOnlineDrivers() {
        return this.onlineDrivers;
    }
}
