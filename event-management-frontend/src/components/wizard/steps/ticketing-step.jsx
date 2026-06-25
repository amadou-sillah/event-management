import { Input } from "../../ui/input";

export function TicketingStep({ data, updateData }) {
  return (
    <div className="space-y-4">
      <div><label>Ticket Price ($)</label><Input type="number" step="0.01" value={data.ticketPrice} onChange={e => updateData({ ticketPrice: parseFloat(e.target.value) })} /></div>
      <div className="text-sm text-muted-foreground">You can add multiple ticket types later.</div>
    </div>
  );
}