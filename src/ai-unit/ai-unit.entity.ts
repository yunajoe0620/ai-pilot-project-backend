import { SchoolLevel, Subject } from 'src/enum/ai-question';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_unit')
export class AiUnit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar' })
  category_code: string;

  @Column({ type: 'uuid', nullable: true })
  parent_unit_id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({
    type: 'enum',
    enum: Subject,
  })
  subject_code: Subject;

  @Column({
    name: 'grade_level_code',
    type: 'enum',
    enum: SchoolLevel,
  })
  grade_level_code: SchoolLevel;

  @Column({ type: 'varchar', nullable: true })
  staff_name?: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  created_at: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    precision: 3,
    nullable: true,
  })
  deleted_at?: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    precision: 3,
    nullable: true,
  })
  updated_at?: Date;
}
