/**
 * En-tête de page des espaces connectés : eyebrow façon cartouche,
 * grand titre, description et action alignée à droite.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 border-b border-border pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="eyebrow mb-2.5">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-[0.95rem] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
