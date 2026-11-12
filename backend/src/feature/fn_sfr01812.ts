import { Controller } from '@nestjs/common';

// 이 기능이 만드는 API는 없다.
// 연차 발생(스케줄러)과 근태 승인 시 사용 내역 기록은 시스템 내부 처리이고,
// 발생·사용 내역 확인은 연차 조회 API가 맡는다 (다른 기능).
@Controller('api/v1')
export class FnSfr01812Controller {}
