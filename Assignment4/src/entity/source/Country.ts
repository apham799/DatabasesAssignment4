import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "country"})
export class Country {
    @PrimaryColumn({type: "smallint"})
    country_id: number;

    @Column({ type: "varchar" })
    country: string;

    @Column({ type: "timestamp" })
    last_update: Date;
}