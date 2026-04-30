export const metadata = {
  title: 'About Us - Dhream Market',
  description: 'Learn about Dhream Market - The Smart Commerce Ecosystem powering digital trade in Ghana.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
         <div className="prose prose-lg max-w-none">
           <h1 className="text-3xl font-bold text-gray-900 mb-8">About Dhream Market</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h2>
             <p className="text-gray-600 mb-4">
             Dhream Market is Ghana's premier digital marketplace, connecting vendors and customers 
             through a seamless, secure, and modern e-commerce platform. We are dedicated to 
             powering digital trade across Ghana and beyond, making it easier for businesses to 
             reach customers and for customers to discover quality products.
           </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            Our mission is to democratize commerce by providing a trusted platform where 
            businesses of all sizes can thrive. We believe in:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li><strong>Accessibility:</strong> Making it easy for anyone to buy and sell online</li>
            <li><strong>Trust:</strong> Building a secure and transparent marketplace for everyone</li>
            <li><strong>Growth:</strong> Helping vendors scale their businesses and reach new customers</li>
            <li><strong>Innovation:</strong> Continuously improving our platform with modern technology</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">For Vendors</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Easy store setup and product listing</li>
            <li>Secure payment processing via Paystack</li>
            <li>Order management and fulfillment tools</li>
            <li>Analytics and sales insights</li>
            <li>Verified vendor badges for trusted sellers</li>
            <li>Customer review system to build reputation</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mb-3">For Customers</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Wide selection of products from verified vendors</li>
            <li>Secure checkout with multiple payment options</li>
            <li>Order tracking and status updates</li>
            <li>Review system for informed purchasing</li>
            <li>Protected purchases through our payment system</li>
            <li>Easy returns and refund process</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li><strong>Integrity:</strong> We operate with transparency and honesty in everything we do</li>
            <li><strong>Customer Focus:</strong> We prioritize the needs of our vendors and customers</li>
            <li><strong>Security:</strong> We protect user data and transactions with robust measures</li>
            <li><strong>Quality:</strong> We maintain high standards in our platform and partner vendors</li>
            <li><strong>Community:</strong> We support Ghana's growing digital economy</li>
          </ul>
        </section>

        <section className="mb-8">
           <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Dhream Market</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li><strong>Ghana-First:</strong> Built specifically for the Ghanaian market with local payment methods</li>
            <li><strong>Secure Payments:</strong> Powered by Paystack for reliable and safe transactions</li>
            <li><strong>Verified Vendors:</strong> We vet vendors to ensure quality and trustworthiness</li>
            <li><strong>Local Support:</strong> Our support team is available to help in Ghana</li>
            <li><strong>GHS Pricing:</strong> All prices displayed in Ghana Cedis for clarity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
           <p className="text-gray-600 mb-4">
             Dhream Market was founded with the vision of creating a trusted online marketplace that 
             serves the unique needs of Ghanaian businesses and consumers. We recognized the need 
             for a platform that understands local commerce while offering the modern technology 
             that online shopping demands.
           </p>
          <p className="text-gray-600 mb-4">
            Today, we continue to grow and evolve, adding new features and services that make 
            online shopping better for everyone. We are committed to being the go-to platform 
            for digital commerce in Ghana.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-gray-600 mb-4">
            We would love to hear from you! Whether you're a vendor looking to sell on our 
            platform, a customer with questions, or a potential partner, reach out to us 
            through our Contact page.
          </p>
             <p className="text-gray-600 mb-4">
             <strong>Email:</strong> support@dhreamarket.com<br />
             <strong>Phone:</strong> Available on our Contact page<br />
             <strong>Address:</strong> Accra, Ghana
           </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Us</h2>
          <p className="text-gray-600 mb-4">
            Whether you want to start selling or prefer to shop from trusted vendors, Dhraverse 
            is here to serve you. Join our growing community of vendors and customers and 
            experience the future of digital commerce in Ghana.
          </p>
        </section>
      </div>
    </div>
  )
}