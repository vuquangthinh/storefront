import React from "react";

interface SizeRow {
  size: string;
  width: string;
  length: string;
  sleeve: string;
  tolerance: string;
}

const data: SizeRow[] = [
  { size: "S", width: "18.00", length: "28.00", sleeve: "15.10", tolerance: "±1.50" },
  { size: "M", width: "20.00", length: "29.00", sleeve: "16.50", tolerance: "±1.50" },
  { size: "L", width: "22.00", length: "30.00", sleeve: "18.00", tolerance: "±1.50" },
  { size: "XL", width: "24.00", length: "31.00", sleeve: "19.50", tolerance: "±1.50" },
  { size: "2XL", width: "26.00", length: "32.00", sleeve: "21.00", tolerance: "±1.50" },
  { size: "3XL", width: "28.00", length: "33.00", sleeve: "22.40", tolerance: "±1.50" },
  { size: "4XL", width: "30.00", length: "34.00", sleeve: "23.70", tolerance: "±1.50" },
  { size: "5XL", width: "32.00", length: "35.00", sleeve: "25.00", tolerance: "±1.50" },
];

const SizeGuide: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-xl bg-[#fff5f5] shadow-md">
      <table className="w-full border-collapse text-center font-[Poppins]">
        <thead>
          <tr className="bg-[#d32f2f] text-black">
            <th className="p-3 text-base font-semibold text-center">Size</th>
            <th className="p-3 text-base font-semibold text-right">Width (in)</th>
            <th className="p-3 text-base font-semibold text-right">Length (in)</th>
            <th className="p-3 text-base font-semibold text-right">Sleeve (in)</th>
            <th className="p-3 text-base font-semibold text-right">Tolerance (in)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.size}
              className={i % 2 === 0 ? "bg-[#ffecec]" : "bg-[#fff5f5]"}
            >
              <td className="border-b border-[#f1cccc] p-2 text-center">{row.size}</td>
              <td className="border-b border-[#f1cccc] p-2 text-right">{row.width}</td>
              <td className="border-b border-[#f1cccc] p-2 text-right">{row.length}</td>
              <td className="border-b border-[#f1cccc] p-2 text-right">{row.sleeve}</td>
              <td className="border-b border-[#f1cccc] p-2 text-right">{row.tolerance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SizeGuide;
