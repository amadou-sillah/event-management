export function PreviewStep({ data }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{data.title || "Untitled Event"}</h3>
      <p className="text-sm">{data.description || "No description"}</p>
      <p><strong>When:</strong> {data.startDate ? new Date(data.startDate).toLocaleString() : "TBD"} – {data.endDate ? new Date(data.endDate).toLocaleString() : "TBD"}</p>
      <p><strong>Where:</strong> {data.venue}, {data.city}</p>
      <p><strong>Capacity:</strong> {data.capacity} | <strong>Price:</strong> ${data.ticketPrice}</p>
    </div>
  );
}