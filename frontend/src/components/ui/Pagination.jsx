// frontend/src/components/ui/Pagination.jsx
export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2 justify-center items-center mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      {[...Array(totalPages)].map((_, i) => (
        <Button
          key={i + 1}
          variant={currentPage === i + 1 ? 'primary' : 'secondary'}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
      
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}