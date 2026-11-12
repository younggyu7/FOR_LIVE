import { Controller } from '@nestjs/common';

// 이 기능은 화면만 만든다.
// POST /approval-documents 는 다른 기능(TASK 선행 작업)이 만든다.
@Controller('api/v1')
export class FnSfr03003Controller {}
