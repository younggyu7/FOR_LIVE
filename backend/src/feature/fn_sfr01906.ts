import { Controller } from '@nestjs/common';

// 이 기능(FN-SFR-019-06)은 화면만 만든다.
// 사용하는 API는 다른 기능이 만든다.
// - POST /annual-leave-plans
// - POST /leave-promotions
// - GET /leave-promotions
@Controller('api/v1')
export class FnSfr01906Controller {}
