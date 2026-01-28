import BlogItem from '@/components/common/BlogItem';
import PageHeading from '@/components/common/PageHeading'
import Layout from '@/components/Layout/Layout'
import { server } from '@/utils';

export async function getServerSideProps() {
    const request = await fetch(`${server}/static/blog.json`);
    const data = await request.json();
    return {
        props: {
            blogs: data
        }, // will be passed to the page component as props
    }
}


const blog = ({ blogs }) => {
    return (
        <>
            <Layout>
                <PageHeading
                    title="Blog"
                    subtitle="An opportunity to introduce the major benefits of"
                    image="/assets/img/extra/page-about.jpg"
                />
                <section className="pt-5 pt-md-7">
                    <div className="container">
                        <div className="row">
                            {blogs?.map((item, index) => <BlogItem key={index} postData={item} />)}
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    )
}

export default blog