'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAction } from 'next-safe-action/hooks';
import { createUserAction, updateUserAction } from '@/lib/actions/auth';
import { signupSchema, updateUserSchema } from '@/schema/auth-schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '@/components/ui/error-message';
import { UserFormProps } from '@/types/user';

type CreateUserFormData = z.infer<typeof signupSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export function UserForm({
  roles,
  onSuccess,
  initialData,
  isEditing = false,
  userId,
}: UserFormProps) {
  const {
    execute: executeCreate,
    result: createResult,
    isExecuting: isCreating,
  } = useAction(createUserAction);
  const {
    execute: executeUpdate,
    result: updateResult,
    isExecuting: isUpdating,
  } = useAction(updateUserAction);

  const isExecuting = isCreating || isUpdating;
  const result = isEditing ? updateResult : createResult;

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: isEditing
      ? {
          name: initialData?.name || '',
          email: initialData?.email || 'placeholder@example.com', // placeholder for validation
          password: 'placeholder123', // placeholder for validation
          confirmPassword: 'placeholder123', // placeholder for validation
          roleId: initialData?.roleId || '',
        }
      : initialData || {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          roleId: '',
        },
    mode: 'onChange',
  });

  const handleSubmit = (data: CreateUserFormData) => {
    if (isEditing && userId) {
      executeUpdate({
        userId,
        name: data.name,
        roleId: data.roleId,
      });
    } else {
      executeCreate(data);
    }
  };

  // Handle success in useEffect
  useEffect(() => {
    if (result?.data?.success) {
      form.reset();
      onSuccess?.();
    }
  }, [result, form, onSuccess]);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user's full name"
                    type="text"
                    autoComplete="name"
                    disabled={isExecuting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditing && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter user's email address"
                        type="email"
                        autoComplete="email"
                        disabled={isExecuting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter user's password"
                        type="password"
                        autoComplete="new-password"
                        disabled={isExecuting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm user's password"
                        type="password"
                        autoComplete="new-password"
                        disabled={isExecuting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isExecuting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role">
                        {field.value && (
                          <span className="truncate">
                            {roles.find((role) => role.id === field.value)?.name}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <ErrorMessage message={result?.serverError} />
          <ErrorMessage message={result?.validationErrors?._errors} />
          {!isEditing && (
            <ErrorMessage message={(result?.validationErrors as any)?.email?._errors} />
          )}
          <ErrorMessage message={result?.validationErrors?.roleId?._errors} />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isExecuting} className="w-full">
              {isExecuting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update User'
                : 'Create User'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
