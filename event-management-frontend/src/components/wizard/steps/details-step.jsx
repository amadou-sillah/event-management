import { Input } from "../../ui/input";

export function DetailsStep({ data, updateData, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Event Title *</label>
        <Input
          value={data.title}
          onChange={e => updateData({ title: e.target.value })}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Description *</label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows="4"
          value={data.description}
          onChange={e => updateData({ description: e.target.value })}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={data.category}
          onChange={e => updateData({ category: e.target.value })}
        >
          <option>Conference</option>
          <option>Workshop</option>
          <option>Webinar</option>
          <option>Networking</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Banner Image URL</label>
        <Input
          value={data.imageUrl}
          onChange={e => updateData({ imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* ---- Status Field ---- */}
      <div>
        <label htmlFor="status" className="text-sm font-medium">Status</label>
        <select
          id="status"
          value={data.status || 'draft'}
          onChange={e => updateData({ status: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Draft: Not visible to attendees | Published: Ready for attendees | Completed: Event has passed
        </p>
      </div>
    </div>
  );
}
