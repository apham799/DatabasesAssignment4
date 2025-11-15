import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "dim_actor" })
export class DimActor {
    @PrimaryGeneratedColumn()
    actor_key: number;

    @Column({unique: true})
    actor_id: number;

    @Column({ type: "text" })
    first_name: string;

    @Column({ type: "text" })
    last_name: string;

    @Column({ type: "date" })
    last_update: Date;
}