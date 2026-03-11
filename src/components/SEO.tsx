import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
}

export const SEO = ({
    title = 'HireBricks — Modern Hiring Platform',
    description = 'Screen, interview, and hire top talent 4x faster with intelligent workflows, skills-based matching, and intuitive candidate evaluation.',
    type = 'website',
    image = 'https://hirebricks.com/og-image.jpg', // Placeholder image URL
    url = 'https://hirebricks.com',
}: SEOProps) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* OpenGraph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
