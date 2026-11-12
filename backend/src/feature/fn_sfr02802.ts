import { Controller } from '@nestjs/common';

// 이 기능은 HTTP API를 받지 않는다.
// 각 메뉴의 업무 이벤트가 발생하면 시스템 내부에서 수신 대상자 확인, 통합알림 생성, 채널 발송이 자동으로 처리된다.
@Controller('api/v1')
export class FnSfr02802Controller {}
