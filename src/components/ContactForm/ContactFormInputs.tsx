import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { validateFirstName, validateLastName } from '../../utils/validators';
import CustomSelect from '../common/Input/CustomSelect';
import Input from '../common/Input/Input';
import PhoneInput from '../common/Input/PhoneInput';
import TextArea from '../common/Input/TextArea';

const subjects = [
  { value: 'teklif', label: 'Teklif Almak İstiyorum' },
  { value: 'iptal', label: 'Poliçemi İptal Etmek İstiyorum' },
  { value: 'hasar', label: 'Hasar Başvurusunda Bulunmak İstiyorum' },
  { value: 'diger', label: 'Diğer' },
];

const ContactFormInputs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.subject) {
      return;
    }

  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Ad"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          validate={validateFirstName}
          required
          showValidation={showValidation}
        />

        <Input
          label="Soyad"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          validate={validateLastName}
          required
          showValidation={showValidation}
        />
      </div>

      <PhoneInput
        value={formData.phone}
        onChange={(value) => handleChange('phone', value)}
        required
        showValidation={showValidation}
      />

      <CustomSelect
        label="Konu"
        value={formData.subject}
        onChange={(value) => handleChange('subject', value)}
        options={subjects}
        required
        error={showValidation && !formData.subject ? 'Bu alan zorunludur' : undefined}
      />

      <TextArea
        label="Mesajınız"
        name="message"
        value={formData.message}
        onChange={(e) => handleChange('message', e.target.value)}
        rows={6}
      />

      <button
        type="submit"
        className="bg-secondary hover:bg-opacity-90 flex w-full items-center justify-center space-x-2 rounded-lg px-6 py-3.5 font-medium text-white transition-colors"
      >
        <span>Gönder</span>
        <Send className="h-4 w-4" />
      </button>
    </motion.form>
  );
};

export default ContactFormInputs;
