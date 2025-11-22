import { useCallback } from 'react';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useCallback((props: ToastProps) => {
    // Simple console toast for now - can be replaced with a proper toast library
    const prefix = props.variant === 'destructive' ? '❌' : '✅';
    console.log(`${prefix} ${props.title}`, props.description || '');
    
    // You can replace this with a proper toast implementation using react-hot-toast, sonner, etc.
    if (typeof window !== 'undefined') {
      alert(`${props.title}\n${props.description || ''}`);
    }
  }, []);

  return { toast };
}
