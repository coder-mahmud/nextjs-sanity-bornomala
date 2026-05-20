
import { createCourse } from "../actions";

const CreateCoursePage = () => {
  return (
    <section className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Create Course
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new video course to your platform.
        </p>
      </div>

      <form
        action={createCourse}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Complete JavaScript Course"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <textarea
            name="shortDescription"
            rows={2}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="A concise summary of the course."
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Description
          </label>
          <textarea
            name="description"
            rows={6}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Detailed course description."
          />
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Thumbnail URL
          </label>
          <input
            type="text"
            name="thumbnail"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="https://example.com/course-thumbnail.jpg"
          />
        </div>

        {/* Price & Currency */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              defaultValue="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              type="text"
              name="currency"
              defaultValue="USD"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Level & Duration */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              name="level"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Duration (Minutes)
            </label>
            <input
              type="number"
              name="durationMinutes"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="600"
            />
          </div>
        </div>

        {/* Instructor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Instructor Name
          </label>
          <input
            type="text"
            name="instructorName"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Mahmud Hasan"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            defaultValue="DRAFT"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create Course
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateCoursePage;