// users/user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CreateUserDocument = HydratedDocument<CreateUser>;

@Schema()
export class CreateUser {
  @Prop({
    type: String,
    default: () => new Types.ObjectId().toString(),
  })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  nameWithInitial: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true })
  desiredAreaToLearn: string;

  @Prop({ required: true })
  lessonTime: string;

  @Prop({ required: true })
  lastSchoolAndGrade: string;

  @Prop({ required: true })
  examPreference?: string;

  @Prop({ required: true })
  fatherGuardianName: string;

  @Prop({ required: true })
  fatherGuardianProfession: string;

  @Prop({ required: true })
  fatherGuardianAddress: string;
  @Prop({ required: true })
  fatherGuardianRelationship: string;

  @Prop({ required: true })
  fatherGuardianPhoneNumber: string;

  @Prop({ required: false, default: false })
  status: boolean;

  @Prop({ required: false, default: false })
  isApproved: boolean;

  @Prop({ required: true })
  birthCertificate: string;

  @Prop({ required: false })
  birthCertificateValid: boolean;

  @Prop({ required: true })
  schoolRecords: string;

  @Prop({ required: false })
  schoolRecordsValid: boolean;

  @Prop({ required: true })
  photo: string;

  @Prop({ required: false })
  photoValid: boolean;

  @Prop({ required: false })
  feeAmount: Number;

  @Prop({ required: false })
  feeStatus: boolean;

  @Prop({ required: false })
  feePaymentDate: string;
}

export const CreateUserSchema = SchemaFactory.createForClass(CreateUser);

CreateUserSchema.set('timestamps', true);

CreateUserSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

CreateUserSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

CreateUserSchema.index({ email: 1 });
CreateUserSchema.index({ role: 1 });
CreateUserSchema.index({ name: 1 });
CreateUserSchema.index({ password: 1 });
