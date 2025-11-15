import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "language"})
export class Language {
    @PrimaryColumn({ type: "tinyint", unsigned: true })
    language_id: number;

    @Column({ type: "char", length: 20})
    name: string;

    @Column({ type: "timestamp" })
    last_update: Date;
}