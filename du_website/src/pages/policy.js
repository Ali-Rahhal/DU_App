import Layout from "@/components/Layout/Layout";
import React from "react";
// import { BarcodeScanner } from "react-barcode-scanner";
// import "react-barcode-scanner/polyfill";

const policy = () => {
  return (
    <>
      <style>{`
        .text2 {
            font-weight: 700;
            color: #000;
            font-size: 1.1rem;
        }
        `}</style>

      <Layout>
        <section className="pt-5 pt-md-7">
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-lg-12">
                {/* <h3 className="mb-3 text-uppercase">Privacy Policy</h3>
                                <p className="text2">
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut hic voluptatibus unde quam veritatis quae velit aperiam. Voluptatem
                                    laboriosam odio nulla, hic eius porro recusandae, nisi non quae nihil unde!
                                </p>
                                <p>&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&quot;</p>
                                <p>&quot;Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?&quot;</p>
                                <p>&quot;But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?&quot;</p>
                                <p>&quot;At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.&quot;</p>
                                <p>&quot;On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.&quot;
                                </p> */}
                <h3 className="mb-3 text-uppercase">Return Policy</h3>
                <p className="text2">1. General Return Policy</p>
                <p>
                  At Droguerie de L'Union, your satisfaction is our top
                  priority. We understand that sometimes products need to be
                  returned, and we strive to make the process as smooth as
                  possible.
                </p>
                <p className="text2">2. Eligibility for Returns</p>
                <ul>
                  <li>
                    Prescription Medications: Due to regulatory and safety
                    concerns, prescription medications are not eligible for
                    return or exchange unless there is a manufacturer defect or
                    an error in the order on our part.
                  </li>
                  <li>
                    Over-the-Counter (OTC) Products: Unopened and unused OTC
                    products can be returned within 30 days of purchase with the
                    original receipt.
                  </li>
                  <li>
                    Medical Devices and Supplies: Unopened and unused medical
                    devices and supplies can be returned within 30 days of
                    purchase with the original receipt.
                  </li>
                  <li>
                    Health and Wellness Products: Unopened and unused health and
                    wellness products can be returned within 30 days of purchase
                    with the original receipt.
                  </li>
                </ul>
                <p className="text2">3. Return Process</p>
                <ul>
                  <li>
                    <b>Step 1</b>: Contact our customer service team at
                    [Customer Service Contact Information] to initiate a return.
                    Please provide your order number and details of the product
                    you wish to return.
                  </li>
                  <li>
                    <b>Step 2</b>: Our team will provide you with a Return
                    Authorization Number (RAN) and instructions on how to send
                    the product back to us.
                  </li>
                  <li>
                    <b>Step 3</b>: Pack the product securely, including all
                    original packaging and any accessories, and ship it to the
                    address provided by our customer service team.
                  </li>
                  <li>
                    <b>Step 4</b>: Once we receive and inspect the returned
                    product, we will process your refund or exchange within 10
                    business days. Refunds will be issued to the original
                    payment method.
                  </li>
                </ul>
                <p className="text2">4. Non-Returnable Items</p>
                <ul>
                  <li>Opened or used products (unless defective)</li>
                  <li>
                    Products without original packaging or missing accessories
                  </li>
                  <li>Items purchased more than 30 days ago</li>
                  <li>
                    Prescription medications (unless there is a manufacturer
                    defect or error in the order)
                  </li>
                </ul>
                <p className="text2">5. Defective or Damaged Products</p>
                <p>
                  If you receive a defective or damaged product, please contact
                  our customer service team immediately. We will arrange for a
                  replacement or refund and cover the cost of return shipping.
                </p>
                <p className="text2">6. Exchanges</p>
                <p>
                  Exchanges are processed in the same manner as returns. Please
                  follow the return process steps to exchange a product.
                </p>
                <hr />
                <h3 className="mb-3 text-uppercase">Privacy Policy</h3>
                <p className="text2">1. Introduction</p>
                <p>
                  Droguerie de L'Union is committed to protecting your privacy.
                  This Privacy Policy outlines how we collect, use, disclose,
                  and safeguard your information when you visit our website and
                  purchase our products.
                </p>
                <p className="text2">2. Information We Collect</p>
                <ul>
                  <li>
                    Personal Information: Name, address, email address, phone
                    number, payment information, and any other information you
                    provide when making a purchase or contacting customer
                    service.
                  </li>
                  <li>
                    Health Information: Prescription details, health conditions,
                    and other relevant medical information necessary to fulfill
                    your orders.
                  </li>
                  <li>
                    Usage Information: Information about your interactions with
                    our website, including IP address, browser type, and pages
                    visited.
                  </li>
                </ul>
                <p className="text2">3. How We Use Your Information</p>
                <ul>
                  <li>
                    Order Fulfillment: To process and fulfill your orders,
                    including sending order confirmations and shipping
                    notifications.
                  </li>
                  <li>
                    Customer Service: To provide customer support and respond to
                    your inquiries.
                  </li>
                  <li>
                    Personalization: To personalize your experience on our
                    website and recommend products.
                  </li>
                  <li>
                    Marketing: To send promotional materials and updates,
                    provided you have opted in to receive such communications.
                  </li>
                  <li>
                    Legal Compliance: To comply with legal and regulatory
                    requirements.
                  </li>
                </ul>
                <p className="text2">4. How We Share Your Information</p>
                <ul>
                  <li>
                    Service Providers: We may share your information with
                    third-party service providers who assist us in operating our
                    business, such as payment processors and shipping companies.
                  </li>
                  <li>
                    Legal Requirements: We may disclose your information if
                    required by law or in response to valid requests by public
                    authorities.
                  </li>
                  <li>
                    Business Transfers: In the event of a merger, acquisition,
                    or sale of assets, your information may be transferred as
                    part of the transaction.
                  </li>
                </ul>
                <p className="text2">5. Data Security</p>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your information against unauthorized access,
                  alteration, disclosure, or destruction.
                </p>
                <p className="text2">6. Your Rights</p>
                <ul>
                  <li>
                    Access: You have the right to access the personal
                    information we hold about you.
                  </li>
                  <li>
                    Correction: You have the right to request correction of any
                    inaccurate or incomplete information.
                  </li>
                  <li>
                    Deletion: You have the right to request deletion of your
                    personal information, subject to certain legal obligations.
                  </li>
                  <li>
                    Opt-Out: You have the right to opt out of receiving
                    marketing communications from us.
                  </li>
                </ul>
                <p className="text2">7. Cookies and Tracking Technologies</p>
                <p>
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website. You can control the use of
                  cookies through your browser settings.
                </p>
                <p className="text2">8. Changes to This Privacy Policy</p>
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with an updated effective
                  date.
                </p>
                <p className="text2">9. Contact Us</p>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy, please contact us at [Contact Information].
                </p>
                <p>
                  Thank you for choosing Droguerie de L'Union. We are dedicated
                  to providing you with high-quality pharmaceutical products and
                  exceptional customer service.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default policy;
