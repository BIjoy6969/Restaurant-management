import { z } from 'zod';

export const createOrderSchema = z.object({
  tableId: z.string().trim().min(1, 'Table identifier is required.'),
  customerNote: z.string().trim().max(500, 'Customer note is too long.').optional(),
  customerPhone: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().trim().min(1, 'Menu item ID is required.'),
        quantity: z.number().int().min(1, 'Quantity must be an integer of at least 1.').max(50, 'Max 50 per item.'),
        specialInstructions: z.string().trim().max(200, 'Special instruction is too long.').optional(),
      })
    )
    .min(1, 'Your order must contain at least one item.'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const addItemsToOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().trim().min(1, 'Menu item ID is required.'),
        quantity: z.number().int().min(1, 'Quantity must be an integer of at least 1.').max(50, 'Max 50 per item.'),
        specialInstructions: z.string().trim().max(200, 'Special instruction is too long.').optional(),
      })
    )
    .min(1, 'Please specify at least one additional item to add.'),
});

export type AddItemsToOrderInput = z.infer<typeof addItemsToOrderSchema>;

export const billRequestSchema = z.object({
  paymentMethodPreference: z.enum(['CASH', 'CARD', 'SPLIT']).optional(),
  billSlipType: z.enum(['DIGITAL', 'PHYSICAL']).optional(),
  customerPhone: z.string().trim().optional(),
  autoSettle: z.boolean().optional(),
});

export type BillRequestInput = z.infer<typeof billRequestSchema>;
