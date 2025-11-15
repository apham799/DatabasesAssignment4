import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Payment } from "../entity/source/Payment";
import { Staff } from "../entity/source/Staff";
import { FactPayment } from "../entity/target/FactPayment";
import { DimCustomer } from "../entity/target/DimCustomer";
import { DimStore } from "../entity/target/DimStore";
import { getDateKey } from "../utilities/dateUtils";

export async function loadFactPayment(lastSyncTime: Date | null = null) {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const staffRepo = AppDataSource.getRepository(Staff);
    const factPaymentRepo = TargetDataSource.getRepository(FactPayment);
    const dimCustomerRepo = TargetDataSource.getRepository(DimCustomer);
    const dimStoreRepo = TargetDataSource.getRepository(DimStore);

    //const payments = await paymentRepo.find();
    let query = paymentRepo.createQueryBuilder("p");

    if (lastSyncTime) {
        query = query.where("p.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching payments updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all payments (initial load)`);
    }

    const payments = await query.getMany();

    if (payments.length === 0) {
        console.log(`  No new/updated payments found`);
        return;
    }

    const staffMembers = await staffRepo.find();
    const staffStoreMap = new Map(
        staffMembers.map(s => [s.staff_id, s.store_id])
    );
    const customers = await dimCustomerRepo.find();
    const stores = await dimStoreRepo.find();
    const customerKeyMap = new Map(customers.map(c => [c.customer_id, c.customer_key]));
    const storeKeyMap = new Map(stores.map(s => [s.store_id, s.store_key]));
    const factPayments = payments
        .map(p => {
            const storeId = staffStoreMap.get(p.staff_id);
            if (!storeId) return null;

            const customerKey = customerKeyMap.get(p.customer_id);
            const storeKey = storeKeyMap.get(storeId);

            // Skip if any key is missing
            if (!customerKey || !storeKey) return null;

            const dateKeyPaid = getDateKey(p.payment_date);
            if (!dateKeyPaid) return null;

            return {
                payment_id: p.payment_id,
                date_key_paid: dateKeyPaid,
                customer_key: customerKey,
                store_key: storeKey,
                staff_id: p.staff_id,
                amount: p.amount
            };
        })
        .filter(record => record !== null);

    if (factPayments.length > 0) {
        await factPaymentRepo.upsert(factPayments, ["payment_id"]);
        console.log(`Loaded ${factPayments.length} payment facts`);
    }
}