import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "dim_film" })
export class DimFilm {
    @PrimaryGeneratedColumn()
    film_key: number;

    @Column({unique: true})
    film_id : number;

    @Column({ type: "text" })
    title: string;

    @Column({ type: "text" })
    rating: string;

    @Column({ type: "integer" })
    length: number;

    @Column({ type: "text" })
    language: string;

    @Column({ type: "integer" })
    release_year: number;

    @Column({ type: "date" })
    last_update: Date;
}