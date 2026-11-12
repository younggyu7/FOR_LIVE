import { Controller } from '@nestjs/common';

// 이 기능은 새 API를 만들지 않는다.
// GET /menu-usage-logs (listMenuUsageLogs)는 먼저 하는 작업(TASK-092의 공용 API)에서 한 번만 만든다.
@Controller('api/v1')
export class FnSfr03802Controller {}
