
import BlogDetails from "@/components/common/BlogDetails";
import PageHeading from "@/components/common/PageHeading";
import Layout from "@/components/Layout/Layout";
import { findProductIndex, server } from "@/utils";

export async function getServerSideProps(contex) {
    const request = await fetch(`${server}/static/blog.json`);
    const data = await request.json();
    const index = findProductIndex(data, contex.query.slug);
    return {
        props: {
            blog: data[index]
        }
    }
}


const BlogId = ({ blog }) => {
    if (!blog) {
        return <Layout title="Produt Not Found">Produt Not Found</Layout>;
    }

    return (
        <>
            <Layout>
                <PageHeading
                    title={blog?.title}
                    subtitle="An opportunity to introduce the major benefits of"
                    image="/assets/img/extra/page-about.jpg"
                />
                <BlogDetails blog={blog} />
            </Layout>
        </>
    );
};

export default BlogId