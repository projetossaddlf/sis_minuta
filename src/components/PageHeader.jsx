export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
    </div>
  );
}
