type ErrorComponentProps = {
  message: string;
};

export function DefaultErrorBox({ message }: ErrorComponentProps) {
  return (
    <div className="border-2 border-red-500 p-4 mb-4">
      <p className="text-red-500 font-bold">Error:</p>
      <p>{message}</p>
    </div>
  );
}
