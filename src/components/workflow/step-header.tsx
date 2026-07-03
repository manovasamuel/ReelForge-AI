interface StepHeaderProps {
  step: number;
  title: string;
  description?: string;
}

export function StepHeader({ step, title, description }: StepHeaderProps) {
  return (
    <div className="my-6 space-y-2 text-center animate-in fade-in duration-200">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <div className="py-2">
        <span className="inline-block text-[11px] font-bold tracking-widest text-violet-400 uppercase">
          STEP {step}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
    </div>
  );
}
