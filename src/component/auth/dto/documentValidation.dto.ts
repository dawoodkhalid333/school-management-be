import { ApiProperty } from '@nestjs/swagger';

export class DocumentValidationDTO {
  @ApiProperty()
  birthCertificateValid: boolean;

  @ApiProperty()
  schoolRecordsValid: boolean;

  @ApiProperty()
  photoValid: boolean;
}
