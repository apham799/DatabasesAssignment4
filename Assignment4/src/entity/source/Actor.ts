import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "actor"})
export class Actor {
    @PrimaryColumn({type: "smallint"})
    actor_id: number;

    @Column({ type: "varchar", length: 45 })
    first_name: string;

    @Column({ type: "varchar", length: 45 })
    last_name: string;

    @Column({ type: "timestamp" })
    last_update: Date;
}