import React from 'react';
import styles from './reviews.module.scss';

interface FakeReviewCard {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

const REVIEWS: FakeReviewCard[] = [
  {
    name: 'Sofia Martínez',
    role: '(Spain)',
    avatar: '/images/agents/1.jpg',
    quote:
      'I just got this shirt and I’m really impressed! The design looks fresh every week, and the colors stay bright even after multiple washes. The cotton feels breathable and soft, and it fits true to size—perfect for everyday wear here in Europe.',
  },
  {
    name: 'Marcus Allen',
    role: '(USA)',
    avatar: '/images/agents/2.jpg',
    quote:
      'Ordered custom meme tees for my livestream audience. The oversized cut sits perfectly and the neck holds shape, even through back-to-back workouts on camera.',
  },
  {
    name: 'Emma Collins',
    role: '(UK)',
    avatar: '/images/agents/3.jpg',
    quote:
      'Needed 60 tees for a launch tour. Each team member picked their size, yet the print finish stayed consistent across the batch. Fast DHL shipping sealed the deal.',
  },
];

interface FakeReviewsProps {
  title?: string;
  className?: string;
}

const FakeReviews: React.FC<FakeReviewsProps> = ({ title = 'Our clients', className }) => {
  const sectionClass = [styles.reviewSection, className].filter(Boolean).join(' ');

  return (
    <section className={sectionClass} aria-labelledby="review-heading">
      <div className={`container ${styles.inner}`}>
        <h2 id="review-heading" className={styles.reviewTitle}>
          {title}
        </h2>

        <div className="row">
          {REVIEWS.map((review) => (
            <div className="col-md-6 col-lg-4" key={review.name}>
              <div className={styles.reviewItem}>
                <article className={styles.reviewCard}>
                  <span className={styles.reviewQuote}>“</span>
                  <p className={styles.reviewBody}>{review.quote}</p>

                  <div className={styles.reviewAuthor}>
                    {/* <div className={styles.reviewAvatarWrapper}>
                    <img
                      src={review.avatar}
                      alt={`${review.name} avatar`}
                      width={64}
                      height={64}
                      className={styles.reviewAvatar}
                    />
                  </div> */}

                    <div className={styles.reviewMeta}>
                      <h3 className={styles.reviewName}>{review.name}</h3>
                      <span className={styles.reviewRole}>{review.role}</span>
                    </div>
                  </div>
                </article>


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FakeReviews;
