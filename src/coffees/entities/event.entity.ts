import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event extends Document {
  @Prop({
    index: true, // create an index on this field
  })
  name: string;

  @Prop()
  type: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
