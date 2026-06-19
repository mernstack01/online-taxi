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
    ) { }

    @WebSocketServer()
    server!: Server;

    private onlineDrivers =
        new Map<string, string>();

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

        this.onlineDrivers.set(
            user.sub,
            client.id,
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

        this.onlineDrivers.delete(
            user.sub,
        );

        console.log(
            'Disconnected:',
            user.sub,
        );
    }
}
