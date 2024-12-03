import { createQueries } from 'tinybase/with-schemas';
import { store } from './store';
import { Row, Table, TableId } from './schema';

export const queries = createQueries(store);

export function setPartialTableRows<TableIdT extends TableId>(
  tableId: TableIdT,
  table: Table<TableIdT>,
  partialRow: Partial<Table<TableIdT>>
) {
  Object.keys(table).forEach((key) =>
    store.setPartialRow(tableId, key, partialRow as Table<TableIdT>)
  );
}
