import {Entity, PrimaryColumn} from "typeorm";

@Entity({ name: "bridge_film_category" })
export class BridgeFilmCategory {
    @PrimaryColumn()
    film_key: number;

    @PrimaryColumn()
    category_key: number;
}