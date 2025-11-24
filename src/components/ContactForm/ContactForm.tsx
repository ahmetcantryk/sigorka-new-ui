import { motion } from 'framer-motion';
import ContactFormInputs from './ContactFormInputs';
import ContactInfo from './ContactInfo';

const ContactForm = () => {
  return (
    <section id="contact" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900">İletişime Geçin</h2>
          <p className="text-lg text-gray-600">
            Sorularınız için bize ulaşın, en kısa sürede dönüş yapalım
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          <ContactFormInputs />
          <ContactInfo />
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
