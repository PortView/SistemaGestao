import { cn } from "../../lib/utils";

/**
 * Componente Skeleton
 * Usado para mostrar um estado de carregamento antes que o conteúdo real seja carregado
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  );
}
