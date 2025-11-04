export type HomeSlide = {
  key: string;
  image: string;
  backgroundColor: string;
  subtitle: string;
  titleHtml: string; // safe HTML injected
  align?: 'left' | 'right';
  buttonText?: string;
  buttonHref?: string;
};

export const HOME_SLIDES: HomeSlide[] = [
  {
    key: 'slide-1',
    image: '/images/home/slides/image.png',
    backgroundColor: '#46321cff',
    subtitle: 'Performance & Lifestyle',
    titleHtml:
      '<span class="font-weight-bold text-primary ls-s">Introducing</span><br/>Fashion Lifestyle<br/>Collection',
    align: 'left',
    buttonText: 'Shop now',
    buttonHref: '/products',
  },
  // {
  //   key: 'slide-2',
  //   image: '/images/home/slides/2.jpg',
  //   backgroundColor: '#ececf3',
  //   subtitle: 'Professional',
  //   titleHtml: 'Pulseira Inteligente <br />Smart Band 5',
  //   align: 'right',
  //   buttonText: 'Shop now',
  //   buttonHref: '/products',
  // },
];
