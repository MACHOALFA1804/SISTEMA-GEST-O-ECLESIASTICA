import React from 'react';
import { useResponsive, useResponsiveClasses } from '../../hooks/useResponsive';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  name: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  fullWidth?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  columns?: 1 | 2 | 3;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 3,
  fullWidth = false,
  disabled = false,
  error,
  helperText,
  className = ''
}) => {
  const responsive = useResponsive();
  const classes = useResponsiveClasses();

  const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    error 
      ? 'border-red-300 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400'
  } ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  const labelClasses = `block text-sm font-medium text-gray-700 mb-2 ${
    required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''
  }`;

  const fieldClassName = `${
    fullWidth || responsive.isMobile 
      ? 'col-span-full' 
      : ''
  } ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`${baseInputClasses} resize-none`}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={value as string}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{placeholder || 'Selecione...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={value as boolean}
              onChange={onChange}
              required={required}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  required={required}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={fieldClassName}>
        {renderInput()}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }

  return (
    <div className={fieldClassName}>
      <label className={labelClasses}>
        {label}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className = '',
  title,
  columns = 1
}) => {
  const responsive = useResponsive();
  const classes = useResponsiveClasses();

  const gridCols = responsive.isMobile 
    ? 'grid-cols-1' 
    : columns === 1 
      ? 'grid-cols-1' 
      : columns === 2 
        ? 'grid-cols-1 md:grid-cols-2' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${classes.spacing.card} ${className}`}>
      {title && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className={`${classes.text.title} text-gray-900`}>
            {title}
          </h2>
        </div>
      )}
      
      <form onSubmit={onSubmit} className={`grid ${gridCols} gap-4`}>
        {children}
      </form>
    </div>
  );
};

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  fullWidth = false,
  className = ''
}) => {
  const responsive = useResponsive();
  
  const alignmentClass = align === 'left' 
    ? 'justify-start' 
    : align === 'center' 
      ? 'justify-center' 
      : 'justify-end';

  const containerClass = responsive.isMobile || fullWidth
    ? 'flex flex-col space-y-2'
    : `flex ${alignmentClass} space-x-3`;

  return (
    <div className={`col-span-full pt-4 border-t border-gray-200 mt-6 ${containerClass} ${className}`}>
      {children}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = ''
}) => {
  const responsive = useResponsive();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClass = fullWidth || responsive.isMobile ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
