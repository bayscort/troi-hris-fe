const ClientSiteSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
};

export default ClientSiteSkeleton;
