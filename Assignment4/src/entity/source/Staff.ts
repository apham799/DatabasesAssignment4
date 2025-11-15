import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "staff"})
export class Staff {
    @PrimaryColumn({type: "tinyint"})
    staff_id: number;

    @Column({ type: "varchar", length: 45 })
    first_name: string;

    @Column({ type: "varchar", length: 45 })
    last_name: string;

    @Column({ type: "smallint", unsigned: true })
    address_id: number;

    @Column({ type: "blob", nullable: true })
    picture: Buffer | null;

    @Column({ type: "varchar", length: 50, nullable: true })
    email: string | null;

    @Column({ type: "tinyint", unsigned: true })
    store_id: number;

    @Column({ type: "tinyint" })
    active: number; // tinyint(1) => store as number not boolean

    @Column({ type: "varchar", length: 16 })
    username: string;

    @Column({ type: "varchar", length: 40, nullable: true })
    password: string | null;

    @Column({ type: "timestamp" })
    last_update: Date;
}