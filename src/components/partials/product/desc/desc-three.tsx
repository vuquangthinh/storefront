import React from 'react';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';

import ALink from '~/components/features/custom-link';

import { toDecimal } from '~/utils';

export default function DescThree ( props ) {
    const { product, isGuide = false } = props;

    let colors = [], sizes = [];

    if ( product.variants.length > 0 ) {
        if ( product.variants[ 0 ].size )
            product.variants.forEach( item => {
                if ( sizes.findIndex( size => size.name === item.size.name ) === -1 ) {
                    sizes.push( { name: item.size.name, value: item.size.size } );
                }
            } );

        if ( product.variants[ 0 ].color ) {
            product.variants.forEach( item => {
                if ( colors.findIndex( color => color.name === item.color.name ) === -1 )
                    colors.push( { name: item.color.name, value: item.color.color } );
            } );
        }
    }

    const setRating = ( e ) => {
        e.preventDefault();

        if ( e.currentTarget.parentNode.querySelector( '.active' ) ) {
            e.currentTarget.parentNode.querySelector( '.active' ).classList.remove( 'active' );
        }

        e.currentTarget.classList.add( 'active' );
    }

    return (
        <Tabs className="tab tab-nav-simple product-tabs mb-4" selectedTabClassName="show" selectedTabPanelClassName="active" defaultIndex={ 0 } >
            <TabList className="nav nav-tabs justify-content-center" role="tablist">
                <Tab className="nav-item">
                    <span className="nav-link">Description</span>
                </Tab>
                <Tab className="nav-item">
                    <span className="nav-link">Additional information</span>
                </Tab>
                {
                    isGuide ?
                        <Tab className="nav-item">
                            <span className="nav-link">Size Guide</span>
                        </Tab> : ''
                }
            </TabList>

            <div className="tab-content">
                <TabPanel className="tab-pane product-tab-description">
                    <div className="row">
                        <div className="col-12 mb-8">
                            <p className="mb-6">
                                Praesent id enim sit amet.Tdio vulputate eleifend in in tortor. ellus massa. siti iMassa ristique sit amet condim vel, facilisis quimequistiqutiqu amet condim Dilisis Facilisis quis sapien. Praesent id enim sit amet.</p>
                            <ul className="mb-6">
                                <li>Praesent id enim sit amet.Tdio vulputate</li>
                                <li>Eleifend in in tortor. ellus massa.Dristique sitii</li>
                                <li>Massa ristique sit amet condim vel</li>
                                <li>Dilisis Facilisis quis sapien. Praesent id enim sit amet</li>
                            </ul>
                            <p className="mb-0">Praesent id enim sit amet odio vulputate eleifend in in tortor. Sellus massa, tristique sitiismonec tellus massa, tristique sit amet condim vel, facilisis quimequistiqutiqu amet condim vel, facilisis Facilisis quis sapien. Praesent id enim sit amet odio vulputate odio vulputate eleifend in in tortor. Sellus massa, tristique sitiismonec tellus massa, tristique sit ametcdimel,facilisis quimequistiqutiqu amet condim vel, facilisis Facilisis sit amet odio vulputate</p>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel className="tab-pane product-tab-additional">
                    <ul className="list-none">
                        {
                            product.categories.length > 0 ?
                                <li><label>Categories:</label>
                                    <p>
                                        { product.categories.map( ( item, index ) => (
                                            <React.Fragment key={ item.name + '-' + index }>
                                                { item.name }
                                                { index < product.categories.length - 1 ? ', ' : "" }
                                            </React.Fragment>
                                        ) ) }
                                    </p>
                                </li> : ""
                        }

                        {
                            product.brands.length > 0 ?
                                <li><label>Brands:</label>
                                    <p>
                                        { product.brands.map( ( item, index ) => (
                                            <React.Fragment key={ item.name + '-' + index }>
                                                { item.name }
                                                { index < product.brands.length - 1 ? ', ' : "" }
                                            </React.Fragment>
                                        ) ) }
                                    </p>
                                </li> : ""
                        }

                        {
                            colors.length > 0 ?
                                <li><label>Color:</label>
                                    <p>
                                        { colors.map( ( item, index ) => (
                                            <React.Fragment key={ item.name + '-' + index }>
                                                { item.name }
                                                { index < colors.length - 1 ? ', ' : "" }
                                            </React.Fragment>
                                        ) ) }
                                    </p>
                                </li> : ""
                        }

                        {
                            sizes.length > 0 ?
                                <li><label>Size:</label>
                                    <p>
                                        {
                                            sizes.map( ( item, index ) => (
                                                <React.Fragment key={ item.name + '-' + index }>
                                                    { item.name }
                                                    { index < sizes.length - 1 ? ', ' : "" }
                                                </React.Fragment>
                                            ) ) }
                                    </p>
                                </li> : ""
                        }
                    </ul>
                </TabPanel>

                {
                    isGuide ?
                        <TabPanel className="tab-pane product-tab-size-guide">
                            <figure className="size-image mt-4 mb-4">
                                <img src="/images/size_guide.png" alt="Size Guide Image" width="217"
                                    height="398" />
                            </figure>
                            <figure className="size-table mt-4 mb-4">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>SIZE</th>
                                            <th>CHEST(IN.)</th>
                                            <th>WEIST(IN.)</th>
                                            <th>HIPS(IN.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th>XS</th>
                                            <td>34-36</td>
                                            <td>27-29</td>
                                            <td>34.5-36.5</td>
                                        </tr>
                                        <tr>
                                            <th>S</th>
                                            <td>36-38</td>
                                            <td>29-31</td>
                                            <td>36.5-38.5</td>
                                        </tr>
                                        <tr>
                                            <th>M</th>
                                            <td>38-40</td>
                                            <td>31-33</td>
                                            <td>38.5-40.5</td>
                                        </tr>
                                        <tr>
                                            <th>L</th>
                                            <td>40-42</td>
                                            <td>33-36</td>
                                            <td>40.5-43.5</td>
                                        </tr>
                                        <tr>
                                            <th>XL</th>
                                            <td>42-45</td>
                                            <td>36-40</td>
                                            <td>43.5-47.5</td>
                                        </tr>
                                        <tr>
                                            <th>XXL</th>
                                            <td>45-48</td>
                                            <td>40-44</td>
                                            <td>47.5-51.5</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </figure>
                        </TabPanel> : ''
                }

            </div>
        </Tabs >
    )
}