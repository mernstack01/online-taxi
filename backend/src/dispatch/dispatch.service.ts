import {
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common';
import { GeolocationService } from '../common/services/geolocation.service';
import { DriverRegistryService } from '../drivers/driver-registry.service';
import { OrdersGateway } from '../order/orders.gateway';

@Injectable()
export class DispatchService {
    constructor(
        private geoService: GeolocationService,
        private registry: DriverRegistryService,

        @Inject(forwardRef(() => OrdersGateway))
        private gateway: OrdersGateway,
    ) {}

    async dispatchOrder(order: {
        pickupLat: number;
        pickupLng: number;
    }) {
        const drivers =
            this.registry.getDriverLocations();

        const nearby: {
            driverId: string;
            distance: number;
        }[] = [];

        for (const [driverId, location] of drivers) {
            const distance =
                this.geoService.calculateDistance(
                    order.pickupLat,
                    order.pickupLng,
                    location.lat,
                    location.lng,
                );

            if (distance <= 3) {
                nearby.push({
                    driverId,
                    distance,
                });
            }
        }

        nearby.sort(
            (a, b) => a.distance - b.distance,
        );

        const topDrivers =
            nearby.slice(0, 3);

        for (const driver of topDrivers) {
            const socketId =
                this.registry
                    .getOnlineDrivers()
                    .get(driver.driverId);

            if (!socketId) {
                continue;
            }

            this.gateway.server
                .to(socketId)
                .emit('newOrder', order);
        }

        return topDrivers;
    }
}
