import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "sync_state" })
export class SyncState {
    @PrimaryColumn({ type: "varchar", length: 100 })
    table_name: string;

    @Column({ type: "datetime" })
    last_sync_time: Date;

    @Column({ type: "datetime" })
    updated_at: Date;
}