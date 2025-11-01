import ALink from '~/components/features/custom-link';

export default function ShopBanner ( props ) {
    const { subTitle = '', title = "Riode Shop", current = "Riode Shop", adClass = '' } = props;

    return (
        <div className={ "page-header " + adClass } style={ { backgroundImage: `url( /images/page-header-back.jpg )`, backgroundColor: "#3C63A4" } }>
            {
                subTitle ? <h3 className="page-subtitle">{ subTitle }</h3> : ''
            }
            {
                title ? <h1 className="page-title ls-m">{ title }</h1> : ''
            }
            <ul className="breadcrumb pb-0">
                <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
                <li className="delimiter">/</li>
                <li>{ current === "Riode Shop" ? "Products" : current }</li>
            </ul>
        </div>
    )
}