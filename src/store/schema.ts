import type * as TinyBaseSchemas from 'tinybase/with-schemas';
import * as UiReact from 'tinybase/ui-react/with-schemas';
import type { WithSchemas } from 'tinybase/ui-react/with-schemas';

export const tablesSchema = {
  people: {
    name: { type: 'string' },
    age: { type: 'number' },
    phone: { type: 'string' },
    birthday: { type: 'string' },
    email: { type: 'string' },
    modified: { type: 'string' },
    accessed: { type: 'string' },
  },
  pets: {
    name: { type: 'string' },
    age: { type: 'number' },
    owner: { type: 'string' },
    type: { type: 'string' },
    modified: { type: 'string' },
    accessed: { type: 'string' },
  },
} satisfies TinyBaseSchemas.TablesSchema;

export const valuesSchema = {
  instructions: { type: 'string' },
} satisfies TinyBaseSchemas.ValuesSchema;

export type TablesSchema = typeof tablesSchema;
export type ValuesSchema = typeof valuesSchema;
export type Tables = TinyBaseSchemas.Tables<TablesSchema>;
export type TableId = keyof Tables;
export type Table<TableIdT extends TableId = TableId> = NonNullable<
  Tables[TableIdT]
>;
export type Row<TableIdT extends TableId> = TinyBaseSchemas.Row<
  TablesSchema,
  TableIdT
>;

export const ReactStore = UiReact as WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
