'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Save, X } from 'lucide-react';
import {
  addInvoiceItem,
  updateInvoiceItem,
  deleteInvoiceItem,
} from '@/app/actions/invoice-actions';
import { toast } from 'sonner';
import { InvoiceItem } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';

interface InvoiceItemsSectionProps {
  invoiceId: string;
  items: InvoiceItem[];
  onItemsChange: () => void;
}

interface NewItemForm {
  itemDescription: string;
  quantity: number;
  unitPrice: number;
}

interface EditingItem extends InvoiceItem {
  isEditing: boolean;
}

export function InvoiceItemsSection({ invoiceId, items, onItemsChange }: InvoiceItemsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    itemDescription: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [editingItems, setEditingItems] = useState<Record<string, EditingItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.itemDescription.trim() || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addInvoiceItem({
        invoiceId,
        itemDescription: newItem.itemDescription,
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice,
      });

      if (result.data?.success) {
        toast.success('Item added successfully');
        setNewItem({ itemDescription: '', quantity: 1, unitPrice: 0 });
        setShowAddForm(false);
        onItemsChange();
      } else {
        toast.error(result.data?.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingItems((prev) => ({
      ...prev,
      [item.id]: { ...item, isEditing: true },
    }));
  };

  const handleCancelEdit = (itemId: string) => {
    setEditingItems((prev) => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    const editingItem = editingItems[itemId];
    if (!editingItem) return;

    if (
      !editingItem.itemDescription.trim() ||
      editingItem.quantity <= 0 ||
      editingItem.unitPrice < 0
    ) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateInvoiceItem({
        id: itemId,
        itemDescription: editingItem.itemDescription,
        quantity: editingItem.quantity,
        unitPrice: editingItem.unitPrice,
      });

      if (result.data?.success) {
        toast.success('Item updated successfully');
        handleCancelEdit(itemId);
        onItemsChange();
      } else {
        toast.error(result.data?.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setIsSubmitting(true);
    try {
      const result = await deleteInvoiceItem({ id: itemId });

      if (result.data?.success) {
        toast.success('Item deleted successfully');
        onItemsChange();
      } else {
        toast.error(result.data?.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEditingItem = (itemId: string, field: keyof EditingItem, value: string | number) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Add and manage line items for this invoice</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Item Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-4">Add New Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Item description"
                  value={newItem.itemDescription}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, itemDescription: e.target.value }))
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit Price"
                  value={newItem.unitPrice}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </div>
        )}

        {/* Items Table */}
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No items added yet</div>
            <div className="text-sm text-muted-foreground mt-1">
              Click &quot;Add Item&quot; to get started
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead className="w-[15%] text-center">Quantity</TableHead>
                <TableHead className="w-[15%] text-right">Unit Price</TableHead>
                <TableHead className="w-[15%] text-right">Line Total</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isEditing = editingItems[item.id]?.isEditing;
                const editingItem = editingItems[item.id];

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          value={editingItem.itemDescription}
                          onChange={(e) =>
                            updateEditingItem(item.id, 'itemDescription', e.target.value)
                          }
                          className="min-h-[60px]"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap">{item.itemDescription}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={editingItem.quantity}
                          onChange={(e) =>
                            updateEditingItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-20 mx-auto"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingItem.unitPrice}
                          onChange={(e) =>
                            updateEditingItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 ml-auto"
                        />
                      ) : (
                        formatCurrency(item.unitPrice)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {isEditing
                        ? formatCurrency(editingItem.quantity * editingItem.unitPrice)
                        : formatCurrency(item.lineTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={isSubmitting}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelEdit(item.id)}
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                            disabled={isSubmitting}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
