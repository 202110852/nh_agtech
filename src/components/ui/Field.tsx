import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputClass =
  'mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50'

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <Field label={label}>
      <input className={`${inputClass} ${className}`} {...props} />
    </Field>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputClass} min-h-24 resize-y ${className}`}
        {...props}
      />
    </Field>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <Field label={label}>
      <select className={`${inputClass} ${className}`} {...props}>
        {children}
      </select>
    </Field>
  )
}

