import React from 'react';

function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About PharmaCare</h1>
          <p className="text-xl">Your health, our priority</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              PharmaCare is a leading online pharmacy platform dedicated to providing quality healthcare products
              to customers across Lebanon. Since our establishment, we've been committed to making healthcare
              accessible and convenient for everyone.
            </p>
            <p className="text-gray-700 mb-4">
              We offer a comprehensive range of medicines, cosmetics, vitamins, and personal care products,
              all sourced from trusted manufacturers and verified for quality and authenticity.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary to-secondary rounded-lg h-64 flex items-center justify-center text-white text-6xl">
            🏥
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-primary">Our Mission</h3>
            <p className="text-gray-700">
              To provide accessible, affordable, and reliable healthcare products to our community,
              ensuring that everyone has the opportunity to maintain their health and wellness.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-primary">Our Vision</h3>
            <p className="text-gray-700">
              To become the most trusted online pharmacy in the region, known for our commitment to
              quality, customer service, and healthcare excellence.
            </p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-2">Quality</h3>
              <p className="text-gray-600">
                We ensure all products meet the highest quality standards
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🤝
              </div>
              <h3 className="text-xl font-bold mb-2">Trust</h3>
              <p className="text-gray-600">
                Building lasting relationships through transparency and reliability
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                💚
              </div>
              <h3 className="text-xl font-bold mb-2">Care</h3>
              <p className="text-gray-600">
                Putting customer health and satisfaction first
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Team</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Our team consists of licensed pharmacists, healthcare professionals, and customer service experts
            dedicated to providing you with the best possible experience. We're here to answer your questions
            and help you make informed decisions about your health.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
