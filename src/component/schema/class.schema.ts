import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop()
  className: string;

  @Prop()
  section: string;

  @Prop()
  teacherName: string;

  @Prop()
  roomNumber: string;

  @Prop()
  subject: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
