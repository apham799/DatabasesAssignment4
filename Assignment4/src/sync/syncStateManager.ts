import { TargetDataSource } from "../data-target";
import { SyncState } from "../entity/target/SyncState";

export class SyncStateManager {
    private syncStateRepo = TargetDataSource.getRepository(SyncState);

    //get the last time where data was sync
    async getLastSyncTime(tableName: string): Promise<Date | null> {
        const syncState = await this.syncStateRepo.findOne({
            where: { table_name: tableName }
        });

        return syncState ? syncState.last_sync_time : null;
    }

    // given a table, update it with last sync time
    async updateSyncTime(tableName: string, syncTime: Date): Promise<void> {
        await this.syncStateRepo.upsert(
            {
                table_name: tableName,
                last_sync_time: syncTime,
                updated_at: new Date()
            },
            ["table_name"]
        );
    }

    //multiple last sync times
    async getLastSyncTimes(tableNames: string[]): Promise<Map<string, Date | null>> {
        const syncStates = await this.syncStateRepo
            .createQueryBuilder("ss")
            .where("ss.table_name IN (:...names)", { names: tableNames })
            .getMany();

        const syncMap = new Map<string, Date | null>();

        // Initialize all tables with null (never synced)
        tableNames.forEach(name => syncMap.set(name, null));

        // Update with actual sync times
        syncStates.forEach(state => {
            syncMap.set(state.table_name, state.last_sync_time);
        });

        return syncMap;
    }

    //multiple sync time updates
    async updateSyncTimes(updates: { tableName: string; syncTime: Date }[]): Promise<void> {
        const records = updates.map(u => ({
            table_name: u.tableName,
            last_sync_time: u.syncTime,
            updated_at: new Date()
        }));

        if (records.length > 0) {
            await this.syncStateRepo.upsert(records, ["table_name"]);
        }
    }
}