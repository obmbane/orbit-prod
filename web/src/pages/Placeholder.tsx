interface Props {
  title: string;
  question: string;
}

/** Temporary page body until each area is built in its own PR. */
export default function Placeholder({ title, question }: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="subtitle">{question}</p>
        </div>
      </div>
      <div className="card empty">
        <strong>Coming soon</strong>
        <p>This screen is not built yet.</p>
      </div>
    </>
  );
}
