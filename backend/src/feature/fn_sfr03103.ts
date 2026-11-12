import { Controller } from '@nestjs/common';

// 완료문서 보관은 결재 완료 시점에 시스템이 자동 실행하는 내부 처리다.
// HTTP로 호출하는 API가 없으므로 이 컨트롤러에는 메서드를 만들지 않는다.
@Controller('api/v1')
export class FnSfr03103Controller {}
