import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useAgencyConfig } from '../../context/AgencyConfigProvider';

const ContactInfo = () => {
  const { agency } = useAgencyConfig();
  
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Telefon',
      details: [
        agency.contact.phone.primary,
        agency.contact.phone.secondary
      ],
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'E-posta',
      details: [
        agency.contact.email.primary,
        agency.contact.email.secondary
      ],
    },
    {
      icon: <MapPin className="h-7 w-7" />,
      title: 'Adres',
      details: [agency.contact.address],
      isAddress: true,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Çalışma Saatleri',
      details: [agency.contact.workingHours.custom],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-8 rounded-2xl bg-gray-50 p-8"
    >
      {contactInfo.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className={`flex ${item.isAddress ? 'items-start' : 'space-x-4'}`}
        >
          <div className="shrink-0 mr-4">
            <div className={`bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg ${item.isAddress ? 'mt-1' : ''}`}>
              {item.icon}
            </div>
          </div>
          <div className={`${item.isAddress ? 'flex-1 max-w-[calc(100%-4rem)]' : ''}`}>
            <h3 className="mb-2 text-lg font-medium text-gray-900">{item.title}</h3>
            {item.details.filter(Boolean).map((detail, i) => (
              <p key={i} className={`text-gray-600 ${item.isAddress ? 'break-words' : ''}`}>
                {detail}
              </p>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ContactInfo;
