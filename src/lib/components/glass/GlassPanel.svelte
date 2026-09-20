<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'default',
    padding = 'p-6',
    class: className = '',
    children,
  }: {
    variant?: 'default' | 'strong' | 'sm' | 'lg';
    padding?: string;
    class?: string;
    children?: Snippet;
  } = $props();

  const variants: Record<string, string> = {
    default: 'glass',
    strong: 'glass glass-strong',
    sm: 'glass glass-sm',
    lg: 'glass glass-lg',
  };
</script>

<div class="{variants[variant]} {padding} {className}">
  {@render children?.()}
</div>
