import { Tables } from './schema';

export const tableData: Tables = {
  people: {
    '123-456-7890': {
      name: 'John Doe',
      age: 30,
      phone: '123-456-7890',
      birthday: '1992-05-15',
      email: 'john.doe@example.com',
    },
    '123-456-7891': {
      name: 'Jane Doe',
      age: 25,
      phone: '123-456-7891',
      birthday: '1997-03-20',
      email: 'jane.doe@example.com',
    },
    '123-456-7892': {
      name: 'Jim Doe',
      age: 40,
      phone: '123-456-7892',
      birthday: '1982-07-10',
      email: 'jim.doe@example.com',
    },
    '123-456-7893': {
      name: 'Jill Doe',
      age: 35,
      phone: '123-456-7893',
      birthday: '1987-09-25',
      email: 'jill.doe@example.com',
    },
    '123-456-7894': {
      name: 'Jack Doe',
      age: 28,
      phone: '123-456-7894',
      birthday: '1994-11-30',
      email: 'jack.doe@example.com',
    },
  },

  pets: {
    'pet-0': {
      name: 'Buddy',
      age: 5,
      owner: '123-456-7890',
      type: 'dog',
    },
    'pet-1': {
      name: 'Whiskers',
      age: 3,
      owner: '123-456-7891',
      type: 'cat',
    },
    'pet-2': {
      name: 'Rex',
      age: 7,
      owner: '123-456-7892',
      type: 'dog',
    },
    'pet-3': {
      name: 'Fluffy',
      age: 2,
      owner: '123-456-7893',
      type: 'cat',
    },
    'pet-4': {
      name: 'Max',
      age: 4,
      owner: '123-456-7894',
      type: 'dog',
    },
  },
};
