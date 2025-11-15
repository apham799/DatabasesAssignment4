import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "film_actor"})
export class FilmActor {
    @PrimaryColumn({type: "smallint"})
    actor_id: number;

    @PrimaryColumn({type: "smallint"})
    film_id: number;

    @Column({type: "timestamp"})
    last_update: Date;
}