// users/user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CreateUserDocument = HydratedDocument<CreateUser>;

@Schema()
export class CreateUser {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;
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
