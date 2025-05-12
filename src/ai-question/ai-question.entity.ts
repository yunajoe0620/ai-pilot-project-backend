import { Difficulty, QuestionType } from 'src/enum/ai-question';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_question')
export class AiQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('uuid')
  unit_id: string;

  @Column({ default: 'N' })
  suneung_yn: string;

  @Column({ type: 'enum' })
  difficulty_code: Difficulty;

  @Column({ type: 'enum' })
  type_code: QuestionType;

  @Column('text')
  question_text: string;

  @Column('text')
  answer_text: string;

  @Column('text')
  explanation_text: string;

  @Column({ default: 'N' })
  image_yn: string;

  @Column({ type: 'uuid', nullable: true })
  wolfram_id: string;

  @Column({ nullable: true })
  media_url: string;

  @Column({ default: 'KOR' })
  national_code: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3, nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', precision: 3, nullable: true })
  deleted_at: Date;
}
