import {Entity, PrimaryColumn} from "typeorm";

@Entity({ name: "bridge_film_actor" })
export class BridgeFilmActor {
    @PrimaryColumn()
    film_key: number;

    @PrimaryColumn()
    actor_key: number;
}