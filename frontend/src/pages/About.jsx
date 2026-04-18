import React from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Cpu, HeartPulse } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            About NephroAI
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Bridging the gap between cutting-edge Deep Learning and clinical diagnostics for faster, more accurate kidney disease detection.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Section 1 */}
          <motion.section variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">The Dataset</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our model is trained on a robust dataset comprising over 10,000 multi and hyperspectral images of kidney tissues. This extensive dataset includes 5,000 normal cases and 5,000 tumor cases, ensuring a balanced and comprehensive learning phase.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Hyperspectral imaging captures a wide spectrum of light for each pixel, providing vastly more information than standard RGB images, which is crucial for identifying subtle cellular anomalies.
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 aspect-square flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-5xl font-black text-slate-200">10,000+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">Images Analyzed</div>
              </div>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 aspect-square flex items-center justify-center">
              <Network className="w-32 h-32 text-slate-200" strokeWidth={1} />
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Network className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Deep Learning Architecture</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We employ a Convolutional Neural Network (CNN) based on the ResNet50 architecture. Utilizing transfer learning from ImageNet, the model leverages pre-learned feature extraction capabilities.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The network ends with a custom dense classification head specifically tuned for distinguishing between normal kidney tissue and tumorous formations with over 90% accuracy.
              </p>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Generative AI Integration</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Diagnosis is only the first step. To provide actionable insights, we integrate with Mistral 7B via Ollama. 
              </p>
              <p className="text-slate-600 leading-relaxed">
                Once a prediction is made, the Large Language Model generates a comprehensive, easy-to-understand medical report detailing potential causes, risk factors, treatment options, and preventative measures based on the specific classification.
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 aspect-square flex items-center justify-center">
              <HeartPulse className="w-32 h-32 text-slate-200" strokeWidth={1} />
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
