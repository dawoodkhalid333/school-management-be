// users/user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CheckInOutDocument = HydratedDocument<CheckInOut>;

@Schema()
export class CheckInOut {
  @Prop({
    type: String,
    default: () => new Types.ObjectId().toString(),
  })
  _id: string;

  @Prop()
  userId: string;

  @Prop()
  time: string;

  @Prop()
  timezone: string;
}

export const CheckInOutSchema = SchemaFactory.createForClass(CheckInOut);

CheckInOutSchema.set('timestamps', true);

CheckInOutSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

CheckInOutSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});
