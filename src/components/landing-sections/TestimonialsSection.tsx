import { motion } from 'framer-motion';

interface TestimonialsSectionProps {
  testimonialsList?: any[];
  testimonialsTitle?: string;
}

export const TestimonialsSection = ({ testimonialsList, testimonialsTitle }: TestimonialsSectionProps) => {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
          {testimonialsTitle || 'Lo que dicen las parejas'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {(testimonialsList || []).map((testimonial: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-slate-700/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-600 flex flex-col h-full hover:bg-white dark:hover:bg-slate-700 transition-colors duration-300"
            >
              <p className="text-slate-600 dark:text-slate-300 italic mb-6 flex-1 self-center text-center">"{testimonial.text}"</p>
              <div className="flex items-center justify-center gap-4 mt-auto">
                {testimonial.avatarUrl && <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
