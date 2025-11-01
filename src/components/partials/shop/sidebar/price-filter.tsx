"use client";
import { useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import InputRange from 'react-input-range';
import Card from '~/components/features/accordion/card';

export default function PriceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query: Record<string, string> = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const initial = useMemo(() => ({
    min: query.min_price ? parseInt(query.min_price) : 0,
    max: query.max_price ? parseInt(query.max_price) : 1000,
  }), [query.min_price, query.max_price]);

  const rangeRef = useRef<{ min: number; max: number }>(initial);

  const onChange = (value: any) => {
    rangeRef.current = { min: value.min, max: value.max };
  };

  const onApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const arr: string[] = [
      `min_price=${rangeRef.current.min}`,
      `max_price=${rangeRef.current.max}`,
      'page=1',
    ];
    for (const key in query) {
      if (key !== 'min_price' && key !== 'max_price' && key !== 'page') {
        arr.push(`${key}=${query[key]}`);
      }
    }
    const url = `${pathname}?${arr.join('&')}`;
    router.push(url);
  };

  return (
    <div className="widget widget-collapsible">
      <Card title="<h3 class='widget-title'>Filter by Price<span class='toggle-btn p-0 parse-content'></span></h3>" type="parse" expanded={true}>
        <div className="widget-body">
          <form action="#">
            <div className="filter-price-slider noUi-target noUi-ltr noUi-horizontal shop-input-range">
              <InputRange
                formatLabel={value => `$${value}`}
                maxValue={1000}
                minValue={0}
                step={50}
                value={rangeRef.current}
                onChange={onChange}
              />
            </div>

            <div className="filter-actions">
              <div className="filter-price-text mb-4">Price: ${rangeRef.current.min} - ${rangeRef.current.max}
                <span className="filter-price-range"></span>
              </div>

              <button className="btn btn-dark btn-filter btn-rounded" onClick={onApply}>Filter</button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
