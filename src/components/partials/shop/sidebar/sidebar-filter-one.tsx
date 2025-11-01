"use client";
import { usePathname, useSearchParams } from 'next/navigation';

 

import ALink from '~/components/features/custom-link';
import CategoryTree from '@/components/partials/shop/sidebar/category-tree';
import SidebarControls, { hideSidebarByType } from '@/components/partials/shop/sidebar/sidebar-controls';



// import { scrollTopHandler } from '~/utils';

function SidebarFilterOne(props: { type?: string }) {
    const { type = "left" } = props;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query: any = Object.fromEntries(searchParams.entries());

    // const [isFirst, setFirst] = useState(true);


    // useEffect(() => {
    //     if (isFirst) {
    //         setFirst(false);
    //     } else {
    //         // scrollTopHandler();
    //     }
    // }, [query])

    const toggleSidebar = (e: any) => {
        e.preventDefault();
        document.querySelector('body')?.classList.remove(`${type === "left" || type === "off-canvas" ? "sidebar-active" : "right-sidebar-active"}`);

        let stickyWraper = e.currentTarget.closest('.sticky-sidebar-wrapper');

        let mainContent = e.currentTarget.closest('.main-content-wrap');
        if (mainContent && type !== "off-canvas" && query.grid !== '4cols')
            mainContent.querySelector('.row.product-wrapper') && mainContent.querySelector('.row.product-wrapper').classList.toggle('cols-md-4');

        if (mainContent && stickyWraper) {
            stickyWraper.classList.toggle('closed');

            let timerId;
            if (stickyWraper.classList.contains('closed')) {
                mainContent.classList.add('overflow-hidden');
                clearTimeout(timerId);
            } else {
                timerId = setTimeout(() => {
                    mainContent.classList.remove('overflow-hidden');
                }, 500);
            }
        }
    }



    return (
        <aside className={`col-lg-3 shop-sidebar skeleton-body ${type === "off-canvas" ? '' : "sidebar-fixed sticky-sidebar-wrapper"} ${type === "off-canvas" || type === "boxed" ? '' : "sidebar-toggle-remain"} ${type === "left" || type === "off-canvas" || type === "boxed" || type === "banner" ? "sidebar" : "right-sidebar"}`}>
            <SidebarControls type={type} />

            <div className="sidebar-content">
                <div className="sticky-sidebar">
                    {
                        type === "boxed" || type === "banner" ? '' :
                            <div className="filter-actions mb-4">
                                <a href="#" className="sidebar-toggle-btn toggle-remain btn btn-outline btn-primary btn-icon-right btn-rounded" onClick={toggleSidebar}>
                                    Filter
                                    {
                                        type === "left" || type === "off-canvas" ?
                                            <i className="d-icon-arrow-left"></i> : <i className="d-icon-arrow-right"></i>
                                    }
                                </a>
                                <ALink href={{ pathname: pathname, query: { grid: query.grid, type: query.type ? query.type : null } }} scroll={false} className="filter-clean">Clean All</ALink>
                            </div>
                    }

                    <CategoryTree pathname={pathname} query={query} type={type} />


                </div>
            </div>
        </aside >
    )
}

export default SidebarFilterOne;