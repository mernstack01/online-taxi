import {
    Module,
    forwardRef,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CommonModule } from '../common/common.module';
import { DriversModule } from '../drivers/drivers.module';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [
        CommonModule,
        DriversModule,
        forwardRef(() => OrderModule),
    ],
    providers: [DispatchService],
    exports: [DispatchService],
})
export class DispatchModule {}
