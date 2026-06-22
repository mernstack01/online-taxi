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
import { DriverRegistryService } from '../drivers/driver-registry.service';
import { PrismaService } from '../prisma/prisma.service';

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
        private registry: DriverRegistryService,
        private prisma: PrismaService,
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

        this.registry.setOnlineDriver(
            user.sub,
            client.id,
        );
    }

    @SubscribeMessage('driverLocation')
    async updateLocation(
        @MessageBody()
        data: {
            lat: number;
            lng: number;
            orderId?: string;
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

        this.registry.updateLocation(
            user.sub,
            data.lat,
            data.lng,
        );

        if (data.orderId) {
            const order =
                await this.prisma.order.findUnique({
                    where: {
                        id: data.orderId,
                    },
                });

            if (order) {
                this.server
                    .to(`user_${order.userId}`)
                    .emit('driverLocationUpdate', {
                        lat: data.lat,
                        lng: data.lng,
                        orderId: data.orderId,
                    });
            }
        }
    }

    @SubscribeMessage('orderArrived')
    async orderArrived(
        @MessageBody()
        data: {
            orderId: string;
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

        const order = await this.updateAssignedOrderStatus(
            data.orderId,
            user.sub,
            'arrived',
        );

        if (!order) {
            return;
        }

        this.server
            .to(`user_${order.userId}`)
            .emit('orderArrived', order);

        this.server
            .to(`user_${order.userId}`)
            .emit('orderStatusChanged', order);

        return order;
    }

    @SubscribeMessage('orderStarted')
    async orderStarted(
        @MessageBody()
        data: {
            orderId: string;
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

        const order = await this.updateAssignedOrderStatus(
            data.orderId,
            user.sub,
            'started',
        );

        if (!order) {
            return;
        }

        this.server
            .to(`user_${order.userId}`)
            .emit('orderStarted', order);

        this.server
            .to(`user_${order.userId}`)
            .emit('orderStatusChanged', order);

        return order;
    }

    @SubscribeMessage('orderCompleted')
    async orderCompleted(
        @MessageBody()
        data: {
            orderId: string;
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

        const order = await this.updateAssignedOrderStatus(
            data.orderId,
            user.sub,
            'completed',
        );

        if (!order) {
            return;
        }

        this.server
            .to(`user_${order.userId}`)
            .emit('orderCompleted', order);

        this.server
            .to(`user_${order.userId}`)
            .emit('orderStatusChanged', order);

        return order;
    }

    private async updateAssignedOrderStatus(
        orderId: string,
        driverId: string,
        status: 'arrived' | 'started' | 'completed',
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    driverId,
                },
            });

        if (!order) {
            return null;
        }

        return this.prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status,
            },
        });
    }

    handleDisconnect(
        client: Socket,
    ) {
        const user =
            client.data.user;

        if (!user) {
            return;
        }

        this.registry.removeOnlineDriver(
            user.sub,
        );

        console.log(
            'Disconnected:',
            user.sub,
        );
    }
}
