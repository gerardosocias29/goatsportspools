const ContactUs = () => {
  return (
    <>
      <div className="flex flex-col gap-5 p-5">
        {/* Header */}
        <div className="flex items-center gap-2 text-primary text-3xl font-semibold">
          Contact Us
        </div>

        {/* Contact Information */}
        <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
          <p className="text-lg">
            We’d love to hear from you! Please fill out the form below or contact us using the information provided.
          </p>

          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">Email:</p>
            <p>support@goatsportspools.com</p>

            <p className="text-lg font-semibold">Phone:</p>
            <p>+1 (123) 456-7890</p>
          </div>

          {/* Contact Form */}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-lg font-semibold">Name</label>
              <input
                type="text"
                id="name"
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Your Name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-lg font-semibold">Email</label>
              <input
                type="email"
                id="email"
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Your Email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-lg font-semibold">Subject</label>
              <input
                type="text"
                id="subject"
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Subject"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-lg font-semibold">Message</label>
              <textarea
                id="message"
                className="p-3 border border-gray-300 rounded-lg"
                placeholder="Your Message"
                rows="5"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="p-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ContactUs;