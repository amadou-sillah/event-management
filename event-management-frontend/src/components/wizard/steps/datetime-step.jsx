import { Input } from "../../ui/input";

export function DateTimeStep({ data, updateData, errors }) {
  return (
    <div className="space-y-4">
      <div><label>Start Date *</label><Input type="datetime-local" value={data.startDate?.slice(0,16)} onChange={e => updateData({ startDate: e.target.value })} />{errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}</div>
      <div><label>End Date *</label><Input type="datetime-local" value={data.endDate?.slice(0,16)} onChange={e => updateData({ endDate: e.target.value })} />{errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}</div>
      <div><label>Venue *</label><Input value={data.venue} onChange={e => updateData({ venue: e.target.value })} />{errors.venue && <p className="text-red-500 text-xs">{errors.venue}</p>}</div>
      <div><label>City</label><Input value={data.city} onChange={e => updateData({ city: e.target.value })} /></div>
      <div><label>Capacity</label><Input type="number" value={data.capacity} onChange={e => updateData({ capacity: parseInt(e.target.value) })} /></div>
    </div>
  );
}