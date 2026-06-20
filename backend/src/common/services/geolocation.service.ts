import { Injectable } from '@nestjs/common';

@Injectable()
export class GeolocationService {
    calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number,
    ): number {
        const R = 6371; // Yer radiusi (km)

        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) *
                Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a),
            );

        return R * c;
    }

    private toRad(value: number) {
        return (value * Math.PI) / 180;
    }
}
