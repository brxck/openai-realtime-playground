import { queries, Row, setPartialTableRows, store, Table } from '@/store';
import { Realtime, ToolHandler } from 'openai-realtime-api';

export type ToolDefinition = {
  schema: Realtime.PartialToolDefinition;
  fn: ToolHandler;
};

export const tools: ToolDefinition[] = [
  {
    schema: {
      name: 'lookup_person',
      description: 'Returns a list of people matching the search query',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the person to lookup',
          },
          phone: {
            type: 'string',
            description: 'The phone number of the person to lookup',
          },
        },
      },
    },
    fn: function queryPeople(params: { name?: string; phone?: string }) {
      queries.setQueryDefinition('selectedPeople', 'people', (q) => {
        store.getTableCellIds('people').forEach((cellId) => q.select(cellId));
        if (params.name) q.where((get) => get('name') === params.name);
        if (params.phone) q.where((get) => get('phone') === params.phone);
      });
      const result = queries.getResultTable(
        'selectedPeople'
      ) as Table<'people'>;
      setPartialTableRows('people', result, {
        accessed: new Date().toISOString(),
      });
      return result;
    },
  },
  {
    schema: {
      name: 'add_person',
      description: 'Adds a person to the database',
      parameters: {
        type: 'object',
        properties: {
          person: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the person to add',
              },
            },
          },
        },
      },
    },
    fn: addPerson,
  },
] as const;

export function addPerson(person: Partial<Row<'people'>>) {
  store.addRow('people', { ...person, modified: new Date().toISOString() });
}

export function addPet(pet: Omit<Row<'pets'>, 'modified' | 'accessed'>) {
  store.addRow('pets', { ...pet, modified: new Date().toISOString() });
}
