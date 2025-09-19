
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import type { ProductType, CashierRole } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const cashierRoles: CashierRole[] = ['Bar', 'Entrance', 'Other'];

interface ManageCategoryRolesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type CategoryRoleState = Record<number, CashierRole[]>;

export default function ManageCategoryRolesDialog({
  isOpen,
  onOpenChange,
}: ManageCategoryRolesDialogProps) {
  const { productTypes, fetchProductTypes } = useStore();
  const { toast } = useToast();
  const [initialCategoryRoles, setInitialCategoryRoles] = useState<CategoryRoleState>({});
  const [categoryRoles, setCategoryRoles] = useState<CategoryRoleState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (isOpen) {
        setIsLoading(true);
        await fetchProductTypes(); // Fetch all types
        
        if (supabase) {
          const { data, error } = await supabase.from('product_category_roles').select('*');
          if (error) {
            console.error('Error fetching category roles:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load category roles.' });
          } else {
            const initialState = data.reduce((acc, row) => {
              if (!acc[row.product_type_id]) {
                acc[row.product_type_id] = [];
              }
              acc[row.product_type_id].push(row.cashier_role);
              return acc;
            }, {} as CategoryRoleState);
            setInitialCategoryRoles(initialState);
            setCategoryRoles(initialState);
          }
        }
        setIsLoading(false);
      }
    }
    loadData();
  }, [isOpen, fetchProductTypes, toast]);

  const handleCheckboxChange = (typeId: number, role: CashierRole, checked: boolean) => {
    setCategoryRoles(prevState => {
      const rolesForType = prevState[typeId] || [];
      if (checked) {
        // Add role if it doesn't exist
        return { ...prevState, [typeId]: [...rolesForType, role] };
      } else {
        // Remove role
        return { ...prevState, [typeId]: rolesForType.filter(r => r !== role) };
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!supabase) return;
    setIsSaving(true);

    const rolesToDelete: { product_type_id: number; cashier_role: CashierRole }[] = [];
    const rolesToInsert: { product_type_id: number; cashier_role: CashierRole }[] = [];

    // Compare initial state with current state to find changes
    const allTypeIds = new Set([...Object.keys(initialCategoryRoles).map(Number), ...Object.keys(categoryRoles).map(Number)]);

    allTypeIds.forEach(typeId => {
      const initialRoles = initialCategoryRoles[typeId] || [];
      const currentRoles = categoryRoles[typeId] || [];

      // Find roles to delete
      initialRoles.forEach(role => {
        if (!currentRoles.includes(role)) {
          rolesToDelete.push({ product_type_id: typeId, cashier_role: role });
        }
      });

      // Find roles to insert
      currentRoles.forEach(role => {
        if (!initialRoles.includes(role)) {
          rolesToInsert.push({ product_type_id: typeId, cashier_role: role });
        }
      });
    });

    let hasError = false;

    // Perform deletions
    if (rolesToDelete.length > 0) {
      for (const role of rolesToDelete) {
        const { error } = await supabase
          .from('product_category_roles')
          .delete()
          .match({ product_type_id: role.product_type_id, cashier_role: role.cashier_role });
        
        if (error) {
          console.error('Error deleting role assignment:', error);
          toast({ variant: 'destructive', title: 'Deletion Error', description: `Failed to remove role ${role.cashier_role} for type ${role.product_type_id}.` });
          hasError = true;
          break;
        }
      }
    }

    // Perform insertions
    if (!hasError && rolesToInsert.length > 0) {
      const { error } = await supabase.from('product_category_roles').insert(rolesToInsert);
      if (error) {
        console.error('Error inserting role assignments:', error);
        toast({ variant: 'destructive', title: 'Insertion Error', description: 'Failed to save new role assignments.' });
        hasError = true;
      }
    }

    if (!hasError) {
      toast({ title: 'Success', description: 'Category roles have been updated.' });
      onOpenChange(false);
    }
    
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Category Roles</DialogTitle>
          <DialogDescription>
            Assign which cashier roles can see each product category. Changes will apply on next login.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full pr-4">
          <div className="space-y-4">
            {isLoading ? <p>Loading categories...</p> : productTypes.map((type, index) => (
              <div key={type.id}>
                <div className="p-2 rounded-md">
                   <h4 className="font-semibold mb-2">{type.name}</h4>
                   <div className="flex items-center space-x-4">
                    {cashierRoles.map(role => (
                        <div key={role} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`${type.id}-${role}`}
                                checked={(categoryRoles[type.id] || []).includes(role)}
                                onCheckedChange={(checked) => handleCheckboxChange(type.id, role, !!checked)}
                            />
                            <label htmlFor={`${type.id}-${role}`} className="text-sm font-medium">
                                {role}
                            </label>
                        </div>
                    ))}
                   </div>
                </div>
                {index < productTypes.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
