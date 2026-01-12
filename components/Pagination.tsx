import Link from "next/link";

const Pagination = ({
  currentPage,
  totalPages,
  pogeSlug = 'results'
}: {
  currentPage: number;
  totalPages: number;
  pogeSlug?:string
}) => {
  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      pages[pages.length - 1] !== "..."
    ) {
      pages.push("...");
    }
  }

  return (
    <div className="flex gap-3 mt-10">
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index}>...</span>
        ) : (
          <Link
            key={index}
            href={`/${pogeSlug}/page/${page}`}
            className={`px-3 py-1 border ${
              page === currentPage
                ? "bg-black text-white"
                : ""
            }`}
          >
            {page}
          </Link>
        )
      )}
    </div>
  );
};
export default Pagination