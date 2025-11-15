import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "film_category"})
export class FilmCategory {
    @PrimaryColumn({type: "smallint"})
    film_id: number;

    @PrimaryColumn({type: "tinyint"})
    category_id: number;

    @Column({type: "timestamp"})
    last_update: Date;
}