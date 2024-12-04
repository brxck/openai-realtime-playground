import { createRelationships, createStore } from 'tinybase/with-schemas';
import { tablesSchema, valuesSchema } from './schema';
import { tableData, valueData } from './data';

export const store = createStore()
  .setSchema(tablesSchema, valuesSchema)
  .setTables(tableData)
  .setValues(valueData);

export type Store = typeof store;

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petsPeople',
  'pets',
  'people',
  'owner',
);
