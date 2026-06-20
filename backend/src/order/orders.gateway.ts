import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { DriverRegistryService } from '../common/services/driver-registry.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class OrdersGateway
    implements
    OnGatewayConnection,
    OnGatewayDisconnect {
    constructor(
        private jwtService: JwtService,
        private driverRegistry: DriverRegistryService,
    ) { }

    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth.token;

            const payload =
                this.jwtService.verify(token);

            client.data.user = payload;

            console.log('Connected:', payload);
        } catch {
            client.disconnect();
        }
    }

    @SubscribeMessage('join')
    joinRoom(
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        if (!user) {
            client.disconnect();
            return;
        }

        client.join(`user_${user.sub}`);
    }

    @SubscribeMessage('joinDriver')
    joinDriverRoom(
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        if (!user || user.role !== 'driver') {
            client.disconnect();
            return;
        }

        client.join('drivers');

        this.driverRegistry.setOnlineDriver(
            user.sub,
            client.id,
        );
    }

    @SubscribeMessage('driverLocation')
    updateLocation(
        @MessageBody()
        data: {
            lat: number;
            lng: number;
        },

        @ConnectedSocket()
        client: Socket,
    ) {
        const user =
            client.data.user;

        if (
            !user ||
            user.role !== 'driver'
        ) {
            return;
        }

        this.driverRegistry.setDriverLocation(
            user.sub,
            {
                lat: data.lat,
                lng: data.lng,
            },
        );

        console.log(
            this.driverRegistry.getDriverLocations(),
        );
    }

    handleDisconnect(
        client: Socket,
    ) {
        const user =
            client.data.user;

        if (!user) {
            return;
        }

        this.driverRegistry.removeDriver(
            user.sub,
        );

        console.log(
            'Disconnected:',
            user.sub,
        );
    }
}
