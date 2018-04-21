export default {
  USERS: {
    options: {
      remove_empty_properties: true,
      disable_array_delete_all_rows: false,
      disable_array_reorder: false,
    },
    type: 'array',
    format: 'table',
    title: 'users',
    uniqueItems: true,
    items: {
      type: 'object',
      title: 'user',
      properties: {
        guid: {
          type: 'string',
          description: 'user id',
          minLength: 4,
        },
        name: {
          type: 'string',
          description: 'first and last name',
          minLength: 4,
        },
        username: {
          type: 'string',
          description: 'nickname',
          minLength: 4,
        },
        email: {
          type: 'string',
          description: 'email address',
          minLength: 4,
        },
        password: {
          type: 'string',
          description: 'password',
          minLength: 4,
        },
      },
    },
    default: [
      {
        name: 'Sergii Bondarenko',
        username: 'trex',
        email: 'trex@email.com',
      },
    ],
  },
};
