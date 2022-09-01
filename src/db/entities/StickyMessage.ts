import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class StickyMessage {
  @PrimaryColumn()
  channelId: string

  @Column()
  messageId: string
  
  @Column()
  message: string
}