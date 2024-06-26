import { Skeleton } from "primereact/skeleton";

const SkeletonTable = () => {
  const rows = Array.from({ length: 6 }, (_, index) => index + 1);
  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="rounded-lg border border-gray w-full md:w-1/4 flex items-center">
          <Skeleton height="40px" />
        </div>
        <div className="flex w-full md:w-1/2 justify-end gap-2 items-center">
          <Skeleton height="24px" width="107px" />
          <Skeleton height="40px" width="72px" className="rounded-lg" />
          <Skeleton height="40px" width="38px" className="rounded-lg" />
          <Skeleton height="40px" width="94px" className="rounded-lg" />
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="bg-background text-white rounded-tl-lg rounded-bl-lg border-none h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white border-r-white border-l-white border h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white border-r-white border-l-white border h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white border-r-white border-l-white border h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white border-r-white border-l-white border h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white border-r-white border-l-white border h-[81px] p-[16px]">
              <Skeleton />
            </th>
            <th className="bg-background text-white rounded-tr-lg rounded-br-lg border-none h-[81px] p-[16px] w-[100px]">
              <Skeleton />
            </th>
          </tr>
        </thead>
        <tbody>
        {rows.map((row) => (
          <tr key={row}>
            <td className="h-[81px] p-[16px]">
              <Skeleton height="20px" borderRadius="3px" />
            </td>
            <td className="h-[81px] p-[16px]">
              <Skeleton />
            </td>
            <td className="h-[81px] p-[16px]">
              <Skeleton />
            </td>
            <td className="h-[81px] p-[16px]">
              <Skeleton />
            </td>
            <td className="h-[81px] p-[16px]">
              <Skeleton />
            </td>
            <td className="h-[81px] p-[16px]">
              <Skeleton />
            </td>
            <td className="h-[81px] p-[16px]">
              <div className="flex align-center gap-4">
                <Skeleton />
                <Skeleton />
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </>
  );
}


export default SkeletonTable;