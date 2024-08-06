// users/user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from 'src/utils/utils';

export type CreateUserDocument = HydratedDocument<CreateUser>;

@Schema()
export class CreateUser {
  @Prop({ type: String, default: generateStringId })
  _id: string;

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

CreateUserSchema.index({ emadmin_email: 1 });
CreateUserSchema.index({ isAdmin: 1 });
CreateUserSchema.index({ admin_name: 1 });
CreateUserSchema.index({ password: 1 });
