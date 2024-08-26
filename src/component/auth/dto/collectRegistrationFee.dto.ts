import { ApiProperty } from '@nestjs/swagger';

export class RegistrationFeeDTO {
  @ApiProperty()
  feeAmount: number;

  @ApiProperty()
  feeStatus: boolean;

  @ApiProperty({ required: false })
  feePaymentDate?: string;
}
