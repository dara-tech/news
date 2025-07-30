'use client';

import React, { useState, ElementType, ComponentPropsWithoutRef } from 'react';
import { FieldError, UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

type FormInputProps<T extends FieldValues> = {
  id: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  Icon?: ElementType;
} & Omit<ComponentPropsWithoutRef<'input'>, 'id'>;

export const FormInput = <T extends FieldValues>({
  id,
  label,
  register,
  error,
  type = 'text',
  Icon,
  ...props
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
        )}
        <input
          id={id}
          type={inputType}
          {...register(id)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3 border rounded-xl bg-white dark:bg-gray-800 transition-all duration-200 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
          } focus:outline-none focus:ring-4 focus:ring-opacity-20`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertTriangle size={12} />
          {error.message}
        </p>
      )}
    </div>
  );
};