import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Language } from "./Language";

@Entity({ name: "film"})
export class Film {
    @PrimaryColumn({ type: "smallint", unsigned: true })
    film_id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "year", nullable: true })
    release_year: number;

    @Column({ type: "tinyint", unsigned: true })
    language_id: number;
    @ManyToOne(() => Language)
    @JoinColumn({ name: "language_id" })
    language: Language;

    @Column({ type: "tinyint", unsigned: true, nullable: true })
    original_language_id: number;

    @Column({ type: "tinyint", unsigned: true })
    rental_duration: number;

    @Column({ type: "decimal", precision: 4, scale: 2 })
    rental_rate: number;

    @Column({ type: "smallint", unsigned: true, nullable: true })
    length: number;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    replacement_cost: number;

    @Column({
        type: "enum",
        enum: ["G", "PG", "PG-13", "R", "NC-17"],
        default: "G"})
    rating: string;

    @Column({
        type: "set",
        enum: ["Trailers", "Commentaries", "Deleted Scenes", "Behind the Scenes"],
        nullable: true })
    special_features: string;

    @Column({ type: "timestamp" })
    last_update: Date;

}