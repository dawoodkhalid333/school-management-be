import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  nameWithInitial: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  dateOfBirth: string;

  @ApiProperty({ enum: ['Memorizing Qur’an', 'Shari yah studies'] })
  desiredAreaToLearn: string;

  @ApiProperty({ enum: ['Morning', 'Evening'] })
  lessonTime: string;

  @ApiProperty()
  lastSchoolAndGrade: string;

  @ApiProperty()
  examPreference?: string; // GCE O/L or A/L Exam

  @ApiProperty()
  fatherGuardianName: string;

  @ApiProperty()
  fatherGuardianProfession: string;

  @ApiProperty()
  fatherGuardianAddress: string;

  @ApiProperty()
  fatherGuardianRelationship: string;

  @ApiProperty()
  fatherGuardianPhoneNumber: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  birthCertificate?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  schoolRecords?: string;

  @ApiProperty()
  photo?: string;

  @ApiProperty()
  password: string;
}
