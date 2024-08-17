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
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: false })
  status: boolean;
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
