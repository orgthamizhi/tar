// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    collections: i.entity({
      createdAt: i.date(),
      description: i.string().optional(),
      isActive: i.boolean(),
      name: i.string().unique().indexed(),
      sortOrder: i.number().optional(),
      updatedAt: i.date(),
    }),
    products: i.entity({
      /* ↓ "columns" become typed attributes */
      title:        i.string().optional(), // will be required after migration
      image:        i.string().optional(),
      medias:       i.json().optional(),
      excerpt:      i.string().optional(),
      notes:        i.string().optional(),
      type:         i.string().optional(),
      category:     i.string().optional(),
      unit:         i.string().optional(),
      price:        i.number().optional(),
      saleprice:    i.number().optional(),
      vendor:       i.string().optional(),
      brand:        i.string().optional(),
      options:      i.json().optional(),
      modifiers:    i.json().optional(),
      metafields:   i.json().optional(),
      saleinfo:     i.json().optional(),
      stores:       i.json().optional(),
      pos:          i.boolean().optional(),
      website:      i.boolean().optional(),
      seo:          i.json().optional(),
      tags:         i.string().optional(),
      cost:         i.number().optional(),
      qrcode:       i.string().optional(),
      stock:        i.number().optional(),
      createdAt:    i.date(),
      updatedAt:    i.date().optional(),
      publishAt:    i.date().optional(),
      publish:      i.boolean().optional(),
      promoinfo:    i.json().optional(),
      featured:     i.boolean().optional(),
      relproducts:  i.json().optional(),
      sellproducts: i.json().optional(),
      // Legacy fields for migration
      name:         i.string().optional(), // will be removed after migration
      description:  i.string().optional(), // will be removed after migration
      sku:          i.string().optional(), // will be removed after migration
      imageUrl:     i.string().optional(), // will be removed after migration
      isActive:     i.boolean().optional(), // will be removed after migration
    }),
  },
  links: {
    productsCollection: {
      forward: {
        on: "products",
        has: "one",
        label: "collection",
      },
      reverse: {
        on: "collections",
        has: "many",
        label: "products",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
